#!/usr/bin/env python3
"""Service des formulaires du site agrielev.com (contact, candidature d'expert).

Remplace Netlify Forms sur le VPS. Le site garde ses formulaires tels quels : ils
envoient leurs données en POST vers /contact/merci/, que le Caddy du site fait
suivre ici. Chaque demande valide part par e-mail (SMTP) à l'équipe ; rien n'est
conservé sur le serveur, sauf le temps de renvoyer une demande dont l'envoi a
échoué (file d'attente, effacée dès l'envoi réussi).

Bibliothèque standard de Python uniquement. Réglages par variables
d'environnement (voir env.exemple). Le journal ne contient jamais le contenu
des demandes.
"""

from __future__ import annotations

import json
import logging
import os
import re
import smtplib
import ssl
import threading
import time
import uuid
from collections import deque
from email.message import EmailMessage
from email.utils import formataddr, formatdate, make_msgid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs

journal = logging.getLogger("formulaires")

TAILLE_MAX = 32 * 1024  # octets acceptés par envoi
PREFIXE_OBJET = "[Site AgriElev]"
EMAIL = re.compile(r"^[^@\s<>\"]+@[^@\s<>\"]+\.[^@\s<>\"]+$")

# Champs de chaque formulaire, dans l'ordre de l'e-mail : nom, libellé, obligatoire, longueur maximale.
FORMULAIRES: dict[str, dict] = {
    "contact": {
        "titre": "Contact",
        "objet": f"{PREFIXE_OBJET} Demande de contact",
        "coordonnees": True,  # un e-mail ou un téléphone
        "champs": [
            ("sujet", "Sujet", True, 60),
            ("profil", "Profil", True, 60),
            ("nom", "Nom et prénom", True, 120),
            ("organisation", "Organisation", False, 160),
            ("zone", "Commune, région ou pays", True, 120),
            ("email", "E-mail", False, 160),
            ("telephone", "Téléphone ou WhatsApp", False, 40),
            ("message", "Message", True, 4000),
            ("depuis", "Page d'origine", False, 300),
        ],
    },
    "candidature-expert": {
        "titre": "Candidature d'expert",
        "objet": f"{PREFIXE_OBJET} Candidature d'expert",
        "coordonnees": False,
        "champs": [
            ("nom", "Nom et prénom", True, 120),
            ("email", "E-mail", True, 160),
            ("telephone", "Téléphone ou WhatsApp", False, 40),
            ("specialite", "Spécialité", True, 160),
            ("diplomes", "Diplômes et expérience", True, 2000),
            ("zone", "Zone d'intervention", True, 160),
            ("disponibilite", "Disponibilité", True, 160),
            ("lien", "Lien vers un profil", False, 300),
            ("message", "Message", False, 3000),
        ],
    },
}


class Refus(Exception):
    """Demande refusée : code HTTP et explication montrée au visiteur."""

    def __init__(self, statut: int, explication: str):
        super().__init__(explication)
        self.statut = statut
        self.explication = explication


# --------------------------------------------------------------------------- lecture et contrôle


def analyser(corps: bytes) -> dict[str, str]:
    """Décode un envoi application/x-www-form-urlencoded (première valeur de chaque champ)."""
    try:
        texte = corps.decode("utf-8")
    except UnicodeDecodeError as erreur:
        raise Refus(400, "Le formulaire n'a pas pu être lu.") from erreur
    valeurs = parse_qs(texte, keep_blank_values=True, max_num_fields=60)
    return {cle: liste[0] for cle, liste in valeurs.items()}


def sur_une_ligne(texte: str) -> str:
    """Retire retours à la ligne et caractères de contrôle (en-têtes d'e-mail)."""
    return re.sub(r"[\x00-\x1f\x7f]+", " ", texte).strip()


def est_un_robot(donnees: dict[str, str]) -> bool:
    """Le champ piège « site_web » est invisible : seul un robot le remplit."""
    return bool(donnees.get("site_web", "").strip())


def controler(donnees: dict[str, str]) -> tuple[str, dict]:
    """Vérifie le formulaire. Rend son code et sa définition, ou lève Refus."""
    code = donnees.get("form-name", "")
    definition = FORMULAIRES.get(code)
    if definition is None:
        raise Refus(400, "Formulaire inconnu.")
    for nom, libelle, obligatoire, longueur in definition["champs"]:
        valeur = donnees.get(nom, "").strip()
        if obligatoire and not valeur:
            raise Refus(400, f"Le champ « {libelle} » est obligatoire.")
        if len(valeur) > longueur:
            raise Refus(400, f"Le champ « {libelle} » est trop long ({longueur} caractères au plus).")
    if not donnees.get("consentement"):
        raise Refus(400, "Merci d'accepter que vos informations servent à traiter votre demande.")
    email = donnees.get("email", "").strip()
    if email and not EMAIL.match(email):
        raise Refus(400, "L'adresse e-mail n'est pas valide.")
    if definition["coordonnees"] and not email and not donnees.get("telephone", "").strip():
        raise Refus(400, "Indiquez un e-mail ou un numéro de téléphone pour que nous puissions vous répondre.")
    return code, definition


# --------------------------------------------------------------------------- composition de l'e-mail


def composer(donnees: dict[str, str], code: str, definition: dict, expediteur: str, destinataire: str) -> EmailMessage:
    objet = sur_une_ligne(donnees.get("subject", ""))
    if not objet.startswith(PREFIXE_OBJET) or len(objet) > 200:
        objet = definition["objet"]
    lignes = [f"Demande reçue par le formulaire « {definition['titre']} » du site agrielev.com.", ""]
    for nom, libelle, _obligatoire, _longueur in definition["champs"]:
        valeur = donnees.get(nom, "").strip()
        if not valeur:
            continue
        if "\n" in valeur:
            lignes += [f"{libelle} :", valeur.replace("\r\n", "\n"), ""]
        else:
            lignes.append(f"{libelle} : {valeur}")
    lignes += ["", "Répondre à cet e-mail écrit directement à la personne quand elle a donné son adresse."]

    message = EmailMessage()
    message["Subject"] = objet
    message["From"] = formataddr(("Site AgriElev", expediteur))
    message["To"] = destinataire
    email = sur_une_ligne(donnees.get("email", ""))
    if email and EMAIL.match(email):
        message["Reply-To"] = formataddr((sur_une_ligne(donnees.get("nom", ""))[:120], email))
    message["Date"] = formatdate(localtime=True)
    message["Message-ID"] = make_msgid(domain="agrielev.com")
    message.set_content("\n".join(lignes))
    return message


# --------------------------------------------------------------------------- limite de débit


class Limiteur:
    """Au plus `par_adresse` envois par adresse IP et `total` envois en tout sur `fenetre` secondes."""

    def __init__(self, par_adresse: int = 5, total: int = 120, fenetre: float = 600.0):
        self.par_adresse, self.total, self.fenetre = par_adresse, total, fenetre
        self._adresses: dict[str, deque] = {}
        self._tous: deque = deque()
        self._verrou = threading.Lock()

    def accepter(self, adresse: str, maintenant: float) -> bool:
        with self._verrou:
            limite = maintenant - self.fenetre
            while self._tous and self._tous[0] < limite:
                self._tous.popleft()
            file = self._adresses.setdefault(adresse, deque())
            while file and file[0] < limite:
                file.popleft()
            if len(file) >= self.par_adresse or len(self._tous) >= self.total:
                return False
            file.append(maintenant)
            self._tous.append(maintenant)
            if len(self._adresses) > 10_000:  # mémoire bornée
                self._adresses = {a: f for a, f in self._adresses.items() if f and f[-1] >= limite}
            return True


# --------------------------------------------------------------------------- envoi et file d'attente


class Messagerie:
    def __init__(self, hote: str, port: int, utilisateur: str, mot_de_passe: str, file_attente: Path):
        self.hote, self.port, self.utilisateur, self.mot_de_passe = hote, port, utilisateur, mot_de_passe
        self.file_attente = file_attente

    def envoyer(self, message: EmailMessage) -> None:
        contexte = ssl.create_default_context()
        with smtplib.SMTP_SSL(self.hote, self.port, timeout=20, context=contexte) as smtp:
            smtp.login(self.utilisateur, self.mot_de_passe)
            smtp.send_message(message)

    def mettre_en_attente(self, message: EmailMessage) -> Path:
        self.file_attente.mkdir(parents=True, exist_ok=True)
        chemin = self.file_attente / f"{int(time.time())}-{uuid.uuid4().hex}.eml"
        descripteur = os.open(chemin, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(descripteur, "wb") as fichier:
            fichier.write(message.as_bytes())
        return chemin

    def en_attente(self) -> list[Path]:
        return sorted(self.file_attente.glob("*.eml")) if self.file_attente.is_dir() else []

    def vider_la_file(self) -> int:
        """Renvoie les demandes en attente ; efface chacune dès qu'elle est partie."""
        from email import message_from_bytes, policy

        envoyes = 0
        for chemin in self.en_attente():
            message = message_from_bytes(chemin.read_bytes(), policy=policy.default)
            try:
                self.envoyer(message)
            except Exception as erreur:  # le réseau ou le serveur SMTP n'est pas revenu
                journal.warning("file d'attente : renvoi impossible (%s), %d en attente", type(erreur).__name__, len(self.en_attente()))
                break
            chemin.unlink(missing_ok=True)
            envoyes += 1
        if envoyes:
            journal.info("file d'attente : %d demande(s) renvoyée(s)", envoyes)
        return envoyes


# --------------------------------------------------------------------------- traitement d'un envoi


class Service:
    def __init__(self, messagerie: Messagerie, expediteur: str, destinataire: str, page_merci: str, limiteur: Limiteur | None = None):
        self.messagerie, self.expediteur, self.destinataire, self.page_merci = messagerie, expediteur, destinataire, page_merci
        self.limiteur = limiteur or Limiteur()

    def traiter(self, corps: bytes, adresse: str, maintenant: float | None = None) -> tuple[int, dict[str, str], str]:
        """Rend (statut, en-têtes, texte) pour un envoi de formulaire."""
        maintenant = time.time() if maintenant is None else maintenant
        merci = (303, {"Location": self.page_merci}, "")
        try:
            donnees = analyser(corps)
            if est_un_robot(donnees):
                journal.info("envoi ignoré : champ piège rempli")
                return merci  # rien ne signale au robot qu'il a été repéré
            code, definition = controler(donnees)
            if not self.limiteur.accepter(adresse, maintenant):
                raise Refus(429, "Trop d'envois en peu de temps. Réessayez dans quelques minutes, ou écrivez-nous directement.")
        except Refus as refus:
            journal.info("envoi refusé (%d) : %s", refus.statut, refus.explication)
            return refus.statut, {"Content-Type": "text/html; charset=utf-8"}, page_refus(refus.explication, self.destinataire)

        message = composer(donnees, code, definition, self.expediteur, self.destinataire)
        try:
            self.messagerie.envoyer(message)
            journal.info("%s : envoyé", code)
        except Exception as erreur:
            try:
                self.messagerie.mettre_en_attente(message)
                journal.warning("%s : envoi impossible (%s), mis en file d'attente", code, type(erreur).__name__)
            except OSError:
                journal.error("%s : envoi impossible et file d'attente indisponible", code)
                texte = "Votre demande n'a pas pu être envoyée. Écrivez-nous directement ou appelez-nous."
                return 503, {"Content-Type": "text/html; charset=utf-8"}, page_refus(texte, self.destinataire)
        return merci


def page_refus(explication: str, contact: str) -> str:
    echapper = lambda t: t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")  # noqa: E731
    return f"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Demande non envoyée · AgriElev</title>
<style>body{{margin:0;font-family:system-ui,sans-serif;background:#FEFAF1;color:#49220F;line-height:1.55}}
main{{max-width:36rem;margin:12vh auto;padding:0 1.25rem}}h1{{color:#224B2B;font-size:1.6rem}}
a{{color:#224B2B;font-weight:700}}</style></head>
<body><main><h1>Votre demande n'est pas partie</h1><p>{echapper(explication)}</p>
<p><a href="javascript:history.back()">Revenir au formulaire</a> (vos réponses y sont encore), ou écrivez à
<a href="mailto:{echapper(contact)}">{echapper(contact)}</a>.</p></main></body></html>"""


# --------------------------------------------------------------------------- serveur HTTP


def creer_gestionnaire(service: Service):
    class Gestionnaire(BaseHTTPRequestHandler):
        server_version = "formulaires"
        sys_version = ""

        def log_message(self, *args):  # pas d'adresse ni de chemin dans le journal
            pass

        def _repondre(self, statut: int, entetes: dict[str, str], texte: str = "") -> None:
            corps = texte.encode("utf-8")
            self.send_response(statut)
            for cle, valeur in entetes.items():
                self.send_header(cle, valeur)
            self.send_header("Content-Length", str(len(corps)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            if corps and self.command != "HEAD":
                self.wfile.write(corps)

        def do_GET(self):
            if self.path == "/sante":
                attente = len(service.messagerie.en_attente())
                self._repondre(200, {"Content-Type": "text/plain; charset=utf-8"}, f"ok, {attente} en attente\n")
            else:
                self._repondre(404, {"Content-Type": "text/plain; charset=utf-8"}, "introuvable\n")

        def do_POST(self):
            type_contenu = self.headers.get("Content-Type", "").split(";")[0].strip().lower()
            if type_contenu != "application/x-www-form-urlencoded":
                self._repondre(415, {"Content-Type": "text/plain; charset=utf-8"}, "type de contenu non accepté\n")
                return
            try:
                longueur = int(self.headers.get("Content-Length", "0"))
            except ValueError:
                longueur = -1
            if longueur < 0 or longueur > TAILLE_MAX:
                self._repondre(413, {"Content-Type": "text/plain; charset=utf-8"}, "envoi trop volumineux\n")
                return
            corps = self.rfile.read(longueur)
            # Adresse du visiteur : première adresse transmise par les proxys (réseau interne seulement).
            adresse = self.headers.get("X-Forwarded-For", "").split(",")[0].strip() or self.client_address[0]
            self._repondre(*service.traiter(corps, adresse))

    return Gestionnaire


def lire_mot_de_passe() -> str:
    fichier = os.environ.get("SMTP_MOT_DE_PASSE_FICHIER")
    if fichier:
        return Path(fichier).read_text(encoding="utf-8").strip()
    return os.environ["SMTP_MOT_DE_PASSE"]


def principal() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    messagerie = Messagerie(
        hote=os.environ.get("SMTP_HOTE", "smtp.hostinger.com"),
        port=int(os.environ.get("SMTP_PORT", "465")),
        utilisateur=os.environ["SMTP_UTILISATEUR"],
        mot_de_passe=lire_mot_de_passe(),
        file_attente=Path(os.environ.get("FILE_ATTENTE", "/file-attente")),
    )
    service = Service(
        messagerie,
        expediteur=os.environ.get("EXPEDITEUR", os.environ["SMTP_UTILISATEUR"]),
        destinataire=os.environ["DESTINATAIRE"],
        page_merci=os.environ.get("PAGE_MERCI", "/contact/merci/"),
    )

    def renvoyer_en_boucle():
        while True:
            time.sleep(int(os.environ.get("INTERVALLE_RENVOI", "300")))
            try:
                messagerie.vider_la_file()
            except Exception:
                journal.exception("file d'attente : erreur inattendue")

    threading.Thread(target=renvoyer_en_boucle, daemon=True).start()
    port = int(os.environ.get("PORT", "8000"))
    journal.info("service des formulaires prêt sur le port %d", port)
    ThreadingHTTPServer(("0.0.0.0", port), creer_gestionnaire(service)).serve_forever()


if __name__ == "__main__":
    principal()
