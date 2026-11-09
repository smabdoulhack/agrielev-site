"""Tests du service des formulaires : python3 -m unittest discover -s deploiement/vps/formulaires"""

import tempfile
import unittest
from pathlib import Path
from unittest import mock
from urllib.parse import urlencode

import service as s

CONTACT = {
    "form-name": "contact", "subject": "[Site AgriElev] Démonstration CuniSmart · Commercial", "depuis": "/",
    "site_web": "", "sujet": "demo-cunismart", "profil": "cooperative", "nom": "Awa Dossou",
    "organisation": "", "zone": "Bohicon", "email": "awa@example.org", "telephone": "",
    "message": "Bonjour,\nnous voulons essayer CuniSmart.", "consentement": "on",
}
EXPERT = {
    "form-name": "candidature-expert", "subject": "[Site AgriElev] Candidature expert", "site_web": "",
    "nom": "Koffi Agbo", "email": "koffi@example.org", "specialite": "Vétérinaire", "diplomes": "Docteur vétérinaire",
    "zone": "Zou", "disponibilite": "Deux jours par mois", "consentement": "on",
}


def corps(donnees: dict) -> bytes:
    return urlencode(donnees).encode("utf-8")


class FausseMessagerie(s.Messagerie):
    def __init__(self, dossier: Path, en_panne: bool = False):
        super().__init__("smtp.invalid", 465, "u", "p", dossier)
        self.envoyes, self.en_panne = [], en_panne

    def envoyer(self, message):
        if self.en_panne:
            raise OSError("réseau coupé")
        self.envoyes.append(message)


class TestService(unittest.TestCase):
    def setUp(self):
        self.dossier = Path(tempfile.mkdtemp())
        self.messagerie = FausseMessagerie(self.dossier)
        self.service = s.Service(self.messagerie, "hello@cunismart.com", "hello@cunismart.com", "/contact/merci/")

    def test_contact_valide_envoye_puis_page_merci(self):
        statut, entetes, _ = self.service.traiter(corps(CONTACT), "1.2.3.4")
        self.assertEqual((statut, entetes["Location"]), (303, "/contact/merci/"))
        message = self.messagerie.envoyes[0]
        self.assertEqual(message["Subject"], CONTACT["subject"])
        self.assertIn("awa@example.org", message["Reply-To"])
        texte = message.get_content()
        self.assertIn("Commune, région ou pays : Bohicon", texte)
        self.assertIn("nous voulons essayer CuniSmart.", texte)
        self.assertNotIn("Organisation", texte)  # champ vide omis

    def test_candidature_expert_valide(self):
        statut, _, _ = self.service.traiter(corps(EXPERT), "1.2.3.4")
        self.assertEqual(statut, 303)
        self.assertIn("Spécialité : Vétérinaire", self.messagerie.envoyes[0].get_content())

    def test_robot_ignore_sans_envoi(self):
        statut, entetes, _ = self.service.traiter(corps({**CONTACT, "site_web": "http://spam"}), "1.2.3.4")
        self.assertEqual((statut, entetes["Location"]), (303, "/contact/merci/"))
        self.assertEqual(self.messagerie.envoyes, [])

    def test_champ_obligatoire_manquant(self):
        statut, _, page = self.service.traiter(corps({**CONTACT, "zone": " "}), "1.2.3.4")
        self.assertEqual(statut, 400)
        self.assertIn("Commune, région ou pays", page)
        self.assertEqual(self.messagerie.envoyes, [])

    def test_contact_sans_aucune_coordonnee(self):
        statut, _, _ = self.service.traiter(corps({**CONTACT, "email": "", "telephone": ""}), "1.2.3.4")
        self.assertEqual(statut, 400)

    def test_consentement_obligatoire(self):
        donnees = dict(CONTACT); del donnees["consentement"]
        self.assertEqual(self.service.traiter(corps(donnees), "1.2.3.4")[0], 400)

    def test_formulaire_inconnu(self):
        self.assertEqual(self.service.traiter(corps({**CONTACT, "form-name": "autre"}), "1.2.3.4")[0], 400)

    def test_objet_force_si_suspect_et_pas_d_injection_d_en_tete(self):
        piege = {**CONTACT, "subject": "Bonjour\r\nBcc: victime@example.org", "nom": "X\r\nBcc: v@example.org"}
        self.service.traiter(corps(piege), "1.2.3.4")
        message = self.messagerie.envoyes[0]
        self.assertEqual(message["Subject"], s.FORMULAIRES["contact"]["objet"])
        self.assertIsNone(message["Bcc"])
        self.assertNotIn("\n", message["Reply-To"])

    def test_limite_par_adresse(self):
        for _ in range(5):
            self.assertEqual(self.service.traiter(corps(CONTACT), "5.5.5.5", maintenant=1000)[0], 303)
        self.assertEqual(self.service.traiter(corps(CONTACT), "5.5.5.5", maintenant=1001)[0], 429)
        self.assertEqual(self.service.traiter(corps(CONTACT), "6.6.6.6", maintenant=1001)[0], 303)
        self.assertEqual(self.service.traiter(corps(CONTACT), "5.5.5.5", maintenant=1000 + 601)[0], 303)

    def test_echec_smtp_met_en_attente_puis_renvoie(self):
        self.messagerie.en_panne = True
        statut, _, _ = self.service.traiter(corps(CONTACT), "1.2.3.4")
        self.assertEqual(statut, 303)  # la personne n'a rien à refaire
        fichiers = self.messagerie.en_attente()
        self.assertEqual(len(fichiers), 1)
        self.assertEqual(fichiers[0].stat().st_mode & 0o777, 0o600)
        self.assertEqual(self.messagerie.vider_la_file(), 0)  # toujours en panne : rien n'est perdu
        self.messagerie.en_panne = False
        self.assertEqual(self.messagerie.vider_la_file(), 1)
        self.assertEqual(self.messagerie.en_attente(), [])
        self.assertEqual(self.messagerie.envoyes[0]["Subject"], CONTACT["subject"])

    def test_texte_trop_long(self):
        self.assertEqual(self.service.traiter(corps({**CONTACT, "message": "a" * 4001}), "1.2.3.4")[0], 400)

    def test_envoi_reel_utilise_smtp_ssl(self):
        messagerie = s.Messagerie("smtp.example.org", 465, "hello@cunismart.com", "secret", self.dossier)
        with mock.patch.object(s.smtplib, "SMTP_SSL") as smtp:
            messagerie.envoyer(s.composer(CONTACT, "contact", s.FORMULAIRES["contact"], "a@b.c", "a@b.c"))
        smtp.assert_called_once()
        connexion = smtp.return_value.__enter__.return_value
        connexion.login.assert_called_once_with("hello@cunismart.com", "secret")
        connexion.send_message.assert_called_once()


if __name__ == "__main__":
    unittest.main()
