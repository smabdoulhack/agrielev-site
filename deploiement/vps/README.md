# Hébergement d'agrielev.com sur le VPS

Le site est servi par le VPS d'AgriElev (OVH, Gravelines), à côté de CuniSmart, selon
l'organisation du serveur : un dossier par application (`/srv/agrielev`), aucun port
publié, le proxy Caddy partagé (`/srv/proxy`) porte les certificats et distribue les
domaines.

```
/srv/agrielev/
  compose.yml, Caddyfile, .env      copies de ce dossier (.env : réglages, droits 600)
  secrets/smtp                      mot de passe SMTP de hello@cunismart.com (droits 600)
  site/versions/<commit>/           les 3 dernières versions construites
  site/courant -> versions/<commit> la version servie
  travail/                          dépôt cloné et paquets npm du constructeur
  file-attente/                     demandes dont l'envoi a échoué, effacées dès le renvoi
```

| Conteneur | Rôle |
|---|---|
| `site` | Caddy : sert `site/courant`, redirige les anciennes adresses (`solutions.html`…), page 404, en-têtes de sécurité et de cache, passe l'envoi des formulaires au service. Joint par le proxy sous le nom `agrielev-site`. |
| `formulaires` | `formulaires/service.py` (Python, bibliothèque standard) : contrôle, champ piège, limite de débit, envoi par e-mail via le SMTP Hostinger. Rien n'est conservé, sauf le temps de renvoyer une demande dont l'envoi a échoué. |
| `construction` | Toutes les 5 minutes, regarde la branche `BRANCHE` du dépôt ; à chaque nouveau commit (code ou article enregistré dans `/admin`), construit, vérifie, puis bascule `site/courant` d'un coup. Un commit qui ne se construit pas laisse le site sur la version précédente. Limité à 2 processeurs et 2 Go. |

## Commandes (depuis le poste, à la racine du projet)

```bash
npm run build                                   # pour l'essai local
deploiement/vps/deployer.sh --essai-local       # essai local : pages, redirections, 404, formulaires
deploiement/vps/deployer.sh                     # essai local puis installation ou mise à jour sur le VPS
deploiement/vps/deployer.sh --essai-envoi       # une vraie demande d'essai, reçue sur hello@cunismart.com
deploiement/vps/deployer.sh --bascule           # après le changement de DNS : proxy, certificat, vérifications
```

Le script ne touche jamais aux fichiers de CuniSmart. Il ne recharge le proxy partagé
qu'après `caddy validate`, et retire son fichier si la configuration est refusée.

Sur le VPS :

```bash
cd /srv/agrielev
docker compose logs -f construction            # constructions et mises en ligne
docker compose logs formulaires                # envois (jamais le contenu des demandes)
cat site/VERSION                               # commit en ligne
ln -sfn versions/<commit> site/courant         # revenir à une version précédente
rm travail/echec                               # relancer la construction d'un commit en échec
```

## Bascule du DNS (hPanel Hostinger, zone agrielev.com)

1. La veille si possible : baisser la durée (TTL) des enregistrements `@` et `www` à 300 s.
2. Si le CDN Hostinger est actif pour le site agrielev.com, le désactiver (il gère sinon les
   enregistrements `@` et `www`).
3. Remplacer :
   - `A @` par `141.94.224.240` (supprimer les autres `A @`) ;
   - `AAAA @` par `2001:41d0:305:2100::1:8717` (supprimer les autres `AAAA @`) ;
   - `www` par un `CNAME` vers `agrielev.com` (supprimer le `CNAME` vers `cdn.hstgr.net`).
4. Ne pas toucher : `MX` et `TXT` (e-mails), et les sous-domaines `api`, `cunismart`,
   `v2-api`, `v2-cunismart`.
5. Lancer `deploiement/vps/deployer.sh --bascule` : il attend que le DNS pointe sur le VPS,
   branche le site sur le proxy, obtient le certificat et vérifie aussi que CuniSmart répond.

Retour arrière : remettre les enregistrements d'origine (le site précédent est toujours dans
`public_html` chez Hostinger).
