#!/bin/sh
# Constructeur du site agrielev.com sur le VPS.
#
# Toutes les INTERVALLE secondes, regarde la branche BRANCHE du dépôt public. Si un
# nouveau commit est arrivé (code, ou article enregistré dans /admin), construit le
# site, le vérifie, puis bascule d'un coup le lien « courant » vers la nouvelle
# version. Les GARDER dernières versions restent pour revenir en arrière :
#   ln -sfn versions/<commit> /srv/agrielev/site/courant
# Un commit dont la construction échoue n'est pas retenté (le site reste sur la
# version précédente) ; le commit suivant relance une construction.
set -eu

DEPOT="${DEPOT:-https://github.com/smabdoulhack/agrielev-site.git}"
BRANCHE="${BRANCHE:-main}"
INTERVALLE="${INTERVALLE:-300}"
GARDER="${GARDER:-3}"
SOURCE=/travail/source
SITE=/site
ECHEC=/travail/echec

journal() { echo "$(date -Iseconds) $*"; }

construire() {
	commit="$1"
	cd "$SOURCE"
	# Paquets réinstallés seulement quand le fichier de verrouillage change.
	if [ ! -f node_modules/.verrou ] || ! cmp -s package-lock.json node_modules/.verrou; then
		journal "installation des paquets"
		npm ci --no-audit --no-fund --loglevel=error
		cp package-lock.json node_modules/.verrou
	fi
	journal "construction de $commit"
	npm run build --silent
	for f in index.html 404.html contact/merci/index.html blog/index.html; do
		[ -s "dist/$f" ] || { journal "fichier attendu absent : $f"; return 1; }
	done
	mkdir -p "$SITE/versions"
	rm -rf "$SITE/versions/$commit.tmp"
	cp -a dist "$SITE/versions/$commit.tmp"
	rm -rf "$SITE/versions/$commit"
	mv "$SITE/versions/$commit.tmp" "$SITE/versions/$commit"
	# Bascule atomique : « courant » change de cible en une seule opération.
	ln -sfn "versions/$commit" "$SITE/courant.nouveau"
	mv -T "$SITE/courant.nouveau" "$SITE/courant"
	echo "$commit" > "$SITE/VERSION"
	# Ménage : on garde les GARDER versions les plus récentes.
	ls -1t "$SITE/versions" | tail -n +"$((GARDER + 1))" | while read -r ancienne; do
		rm -rf "$SITE/versions/$ancienne"
	done
	journal "en ligne : $commit"
}

mkdir -p "$SITE/versions"
if [ ! -d "$SOURCE/.git" ]; then
	journal "clonage de $DEPOT ($BRANCHE)"
	git clone --quiet --branch "$BRANCHE" "$DEPOT" "$SOURCE"
fi

while true; do
	if git -C "$SOURCE" fetch --quiet origin "$BRANCHE"; then
		distant="$(git -C "$SOURCE" rev-parse FETCH_HEAD)"
		en_ligne="$(cat "$SITE/VERSION" 2>/dev/null || true)"
		rate="$(cat "$ECHEC" 2>/dev/null || true)"
		if [ "$distant" != "$en_ligne" ] && [ "$distant" != "$rate" ]; then
			git -C "$SOURCE" checkout --quiet --force "$distant"
			git -C "$SOURCE" clean -fdxq -e node_modules
			if (construire "$distant"); then
				rm -f "$ECHEC"
			else
				echo "$distant" > "$ECHEC"
				journal "échec de la construction de $distant : le site reste sur ${en_ligne:-aucune version}"
			fi
		fi
	else
		journal "dépôt injoignable, nouvel essai dans $INTERVALLE s"
	fi
	sleep "$INTERVALLE"
done
