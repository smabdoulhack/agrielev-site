#!/usr/bin/env bash
# Hébergement du site agrielev.com sur le VPS (à côté de CuniSmart, sans le toucher).
#
#   deploiement/vps/deployer.sh                 essai local, puis installation ou mise à jour sur le VPS
#   deploiement/vps/deployer.sh --essai-local   essai local seulement (site construit dans dist/)
#   deploiement/vps/deployer.sh --essai-envoi   envoie une vraie demande d'essai à DESTINATAIRE
#   deploiement/vps/deployer.sh --bascule       une fois le DNS d'agrielev.com sur le VPS : branchement
#                                               sur le proxy partagé, certificat HTTPS, vérification
#
# Le contenu du site ne passe pas par ce script : le conteneur « construction » le
# reconstruit sur le VPS à chaque commit de la branche BRANCHE (voir README.md).
# Accès : l'alias SSH `cunismart-vps` (~/.ssh/config), ou VPS=utilisateur@hote.
# BRANCHE=<branche> choisit la branche mise en ligne (écrit dans /srv/agrielev/.env ; main par défaut).
set -euo pipefail

VPS="${VPS:-cunismart-vps}"
ICI="$(cd "$(dirname "$0")" && pwd)"
PROJET="$(cd "$ICI/../.." && pwd)"
DISTANT=/srv/agrielev
CADDY=caddy:2.10-alpine
CURL=curlimages/curl:8.11.1

distant() { ssh "$VPS" "$@"; }
etape() { echo "== $*"; }

# Vérifie une adresse : attendu = « code » ou « code cible ».
verifier() {
	local obtenu="$1" adresse="$2" attendu="$3"
	if [[ "$obtenu" == "$attendu"* ]]; then echo "  ok  $adresse -> $obtenu"; else echo "  ÉCHEC  $adresse -> $obtenu (attendu $attendu)"; return 1; fi
}

essai_local() {
	etape "Tests du service des formulaires"
	python3 -m unittest discover -s "$ICI/formulaires" -q 2>&1 | tail -1

	etape "Configuration Caddy"
	docker run --rm -v "$ICI/Caddyfile:/etc/caddy/Caddyfile:ro" "$CADDY" caddy validate --config /etc/caddy/Caddyfile >"$TMP/validation.log" 2>&1 || { cat "$TMP/validation.log"; exit 1; }
	printf '{\n\tadmin off\n}\nimport /sites/*.caddy\n' > "$TMP/proxy.Caddyfile"
	docker run --rm -v "$TMP/proxy.Caddyfile:/etc/caddy/Caddyfile:ro" -v "$ICI/agrielev.caddy:/sites/agrielev.caddy:ro" "$CADDY" \
		caddy validate --config /etc/caddy/Caddyfile >"$TMP/validation.log" 2>&1 || { cat "$TMP/validation.log"; exit 1; }
	echo "  ok  Caddyfile du site et fichier du proxy"

	etape "Essai local du site construit (dist/) et du service des formulaires"
	[[ -s "$PROJET/dist/index.html" ]] || { echo "  dist/ absent : lancer npm run build d'abord"; exit 1; }
	mkdir -p "$TMP/site" "$TMP/attente" && ln -s "$PROJET/dist" "$TMP/site/courant" && chmod 777 "$TMP/attente"
	docker network create agrielev-essai >/dev/null
	docker run -d --rm --name agrielev-essai-formulaires --network agrielev-essai --network-alias agrielev-formulaires \
		-e SMTP_UTILISATEUR=essai -e SMTP_MOT_DE_PASSE=essai -e SMTP_HOTE=127.0.0.1 -e SMTP_PORT=1 \
		-e DESTINATAIRE=essai@example.org -e FILE_ATTENTE=/file-attente \
		-v "$ICI/formulaires/service.py:/app/service.py:ro" -v "$TMP/attente:/file-attente" \
		python:3.13-alpine python -u /app/service.py >/dev/null
	docker run -d --rm --name agrielev-essai-site --network agrielev-essai -p 127.0.0.1:3298:80 \
		-v "$ICI/Caddyfile:/etc/caddy/Caddyfile:ro" -v "$TMP/site:/srv/site:ro" -v "$PROJET/dist:$PROJET/dist:ro" \
		"$CADDY" >/dev/null
	for _ in $(seq 30); do curl -fs -o /dev/null http://127.0.0.1:3298/ && break; sleep 0.5; done
	for _ in $(seq 30); do
		docker exec agrielev-essai-formulaires python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/sante', timeout=2)" 2>/dev/null && break
		sleep 0.5
	done
	local base=http://127.0.0.1:3298
	code() { curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$base$1"; }
	verifier "$(code /)" / 200
	verifier "$(code /solutions)" /solutions "308 $base/solutions/"
	verifier "$(code '/contact?sujet=demo-cunismart')" "/contact?sujet=…" "308 $base/contact/?sujet=demo-cunismart"
	verifier "$(code /cunismart.html)" /cunismart.html "308 $base/cunismart/"
	verifier "$(code /blog/)" /blog/ 200
	verifier "$(code /page-inconnue)" /page-inconnue 404
	curl -s "$base/page-inconnue" | grep -q "Page introuvable" && echo "  ok  la page 404 du site est servie"
	local fichier; fichier="$(cd "$PROJET/dist" && ls _astro/*.css | head -1)"
	curl -sI "$base/$fichier" | grep -qi "cache-control: public, max-age=31536000, immutable" && echo "  ok  cache long sur /_astro"
	envoi() { curl -s -o /dev/null -w '%{http_code} %{redirect_url}' -X POST "$base/contact/merci/" --data-urlencode "$@"; }
	verifier "$(envoi form-name=contact -d site_web=robot)" "envoi d'un robot" "303 $base/contact/merci/"
	verifier "$(envoi form-name=contact -d nom=)" "envoi incomplet" 400
	verifier "$(envoi form-name=contact -d sujet=autre -d profil=autre -d nom=Essai -d zone=Cotonou -d email=essai@example.org -d message=Essai -d consentement=on)" \
		"envoi valide (SMTP injoignable en local)" "303 $base/contact/merci/"
	[[ "$(ls "$TMP/attente" | wc -l)" == 1 ]] && echo "  ok  demande gardée en file d'attente quand le SMTP ne répond pas"
}

installer() {
	etape "Envoi sur le VPS ($VPS:$DISTANT)"
	distant "set -e
		[ -d $DISTANT ] || { sudo mkdir -p $DISTANT && sudo chown \$(id -u):\$(id -g) $DISTANT; }
		mkdir -p $DISTANT/site/versions $DISTANT/travail $DISTANT/file-attente $DISTANT/formulaires $DISTANT/construction $DISTANT/secrets
		chmod 700 $DISTANT/file-attente $DISTANT/secrets"
	scp -q "$ICI/compose.yml" "$ICI/Caddyfile" "$ICI/env.exemple" "$VPS:$DISTANT/"
	scp -q "$ICI/formulaires/service.py" "$VPS:$DISTANT/formulaires/"
	scp -q "$ICI/construction/Dockerfile" "$ICI/construction/construire.sh" "$VPS:$DISTANT/construction/"

	etape "Réglages (créés une seule fois, jamais écrasés)"
	# Le mot de passe SMTP de hello@cunismart.com est déjà sur le serveur (CuniSmart) :
	# il est recopié de fichier à fichier, sans passer par ce poste ni par le journal.
	distant "set -e; cd $DISTANT
		[ -f .env ] || { cp env.exemple .env; chmod 600 .env; echo '  .env créé'; }
		if [ -n '${BRANCHE:-}' ]; then sed -i 's/^BRANCHE=.*/BRANCHE=${BRANCHE:-}/' .env; fi
		echo \"  branche mise en ligne : \$(grep -E '^BRANCHE=' .env | cut -d= -f2)\"
		if [ ! -s secrets/smtp ]; then
			umask 077
			grep '^MAIL_PASSWORD=' /srv/cunismart/.env | head -1 | cut -d= -f2- | sed -e 's/^\"//' -e 's/\"\$//' -e \"s/^'//\" -e \"s/'\$//\" > secrets/smtp
			[ -s secrets/smtp ] && echo '  mot de passe SMTP repris de CuniSmart' || { echo '  mot de passe SMTP introuvable'; exit 1; }
		fi"

	etape "Démarrage des conteneurs"
	distant "set -e; cd $DISTANT
		docker network inspect proxy >/dev/null 2>&1 || docker network create proxy >/dev/null
		docker compose up -d --build --remove-orphans --quiet-pull 2>&1 | grep -v -e '^ *$' | tail -3
		docker compose restart site formulaires >/dev/null"

	etape "Construction du site sur le VPS (première fois : quelques minutes)"
	local attendu; attendu="$(distant "git ls-remote https://github.com/smabdoulhack/agrielev-site.git refs/heads/\$(grep -E '^BRANCHE=' $DISTANT/.env | cut -d= -f2) | cut -f1")"
	for _ in $(seq 120); do
		[[ "$(distant "cat $DISTANT/site/VERSION 2>/dev/null || true")" == "$attendu" ]] && break
		[[ "$(distant "cat $DISTANT/travail/echec 2>/dev/null || true")" == "$attendu" ]] && { distant "cd $DISTANT && docker compose logs --tail 40 construction"; exit 1; }
		sleep 10
	done
	verifier "$(distant "cat $DISTANT/site/VERSION")" "version en ligne" "$attendu"

	etape "Vérification par le réseau du proxy (le DNS n'est pas nécessaire)"
	verifier "$(distant "docker run --rm --network proxy $CURL -s -o /dev/null -w '%{http_code}' http://agrielev-site/")" "agrielev-site /" 200
	verifier "$(distant "docker run --rm --network proxy $CURL -s -o /dev/null -w '%{http_code} %{redirect_url}' http://agrielev-site/solutions")" "agrielev-site /solutions" "308 http://agrielev-site/solutions/"
	verifier "$(distant "docker run --rm --network proxy $CURL -s -o /dev/null -w '%{http_code} %{redirect_url}' -X POST http://agrielev-site/contact/merci/ -d form-name=contact -d site_web=robot")" "formulaire (robot écarté)" "303"
	distant "cd $DISTANT && docker compose ps --format '  {{.Service}} : {{.Status}}'"
}

essai_envoi() {
	etape "Demande d'essai envoyée par le vrai chemin (site, service, SMTP)"
	local code
	code="$(distant "docker run --rm --network proxy $CURL -s -o /dev/null -w '%{http_code}' -X POST http://agrielev-site/contact/merci/ \
		--data-urlencode 'form-name=contact' --data-urlencode 'subject=[Site AgriElev] Essai du formulaire sur le VPS' \
		--data-urlencode 'sujet=autre' --data-urlencode 'profil=autre' --data-urlencode 'nom=Essai technique' \
		--data-urlencode 'zone=VPS' --data-urlencode 'email=hello@cunismart.com' --data-urlencode 'consentement=on' \
		--data-urlencode 'message=Demande d essai envoyée par deploiement/vps/deployer.sh --essai-envoi. Aucune action à faire.'")"
	verifier "$code" "envoi" 303
	sleep 2
	distant "cd $DISTANT && docker compose logs --tail 3 formulaires"
}

bascule() {
	etape "Le DNS pointe-t-il sur le VPS ?"
	local ip; ip="$(distant "curl -4 -s --max-time 10 https://api.ipify.org")"
	for nom in agrielev.com www.agrielev.com; do
		local vu; vu="$(getent ahostsv4 "$nom" | awk 'NR==1{print $1}')"
		[[ "$vu" == "$ip" ]] || { echo "  $nom -> $vu, pas encore $ip : changer le DNS (README.md), attendre, relancer."; exit 1; }
		echo "  ok  $nom -> $ip"
	done
	etape "Branchement sur le proxy partagé"
	scp -q "$ICI/agrielev.caddy" "$VPS:/srv/proxy/sites/"
	distant "docker exec proxy-caddy-1 caddy validate --config /etc/caddy/Caddyfile >/dev/null 2>&1 \
		&& docker exec proxy-caddy-1 caddy reload --config /etc/caddy/Caddyfile >/dev/null && echo '  ok  proxy rechargé' \
		|| { rm -f /srv/proxy/sites/agrielev.caddy; echo '  configuration refusée, fichier retiré, proxy inchangé'; exit 1; }"
	etape "Certificat et adresse publique"
	for _ in $(seq 30); do curl -fsS -o /dev/null https://agrielev.com/ 2>/dev/null && break; sleep 5; done
	verifier "$(curl -s -o /dev/null -w '%{http_code}' https://agrielev.com/)" https://agrielev.com/ 200
	verifier "$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' https://www.agrielev.com/solutions/)" https://www.agrielev.com/solutions/ "308 https://agrielev.com/solutions/"
	verifier "$(curl -s -o /dev/null -w '%{http_code}' https://app.cunismart.com/)" "https://app.cunismart.com/ (CuniSmart intact)" 200
}

TMP="$(mktemp -d)"
trap 'docker rm -f agrielev-essai-site agrielev-essai-formulaires >/dev/null 2>&1 || true; docker network rm agrielev-essai >/dev/null 2>&1 || true; rm -rf "$TMP"' EXIT

case "${1:-}" in
	--bascule) bascule ;;
	--essai-envoi) essai_envoi ;;
	--essai-local) essai_local ;;
	"") essai_local; installer ;;
	*) echo "usage : $0 [--essai-local | --essai-envoi | --bascule]"; exit 2 ;;
esac
