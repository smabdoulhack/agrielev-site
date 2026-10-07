# agrielev.com

Site institutionnel d'AgriElev Bénin SARL (Astro 7, statique, hébergé sur Netlify). Spécification : `docs/superpowers/specs/2026-10-06-site-agrielev-design.md`. Consignes de travail : `CLAUDE.md`.

## Démarrer

    npm install
    npm approve-scripts esbuild sharp
    npm run dev          # http://localhost:4321

## Modifier le contenu

| Contenu | Fichier |
| --- | --- |
| Coordonnées, liens, délai de réponse | `src/data/site.ts` |
| Statuts des espèces et fonctions CuniSmart | `src/data/cunismart.ts` |
| Offres | `src/content/offres/*.yaml` |
| Modules | `src/content/modules.yaml` |
| Articles du blog | `src/content/articles/*.md` (passer `etat: publie` pour publier) |
| Experts, études de cas, formations, documents | `src/content/<collection>/*.yaml` |
| Photos et textes alternatifs | `src/assets/photos/` et `src/data/photos.ts` |

Un contenu en `etat: brouillon` est visible avec `npm run dev`, jamais en production. `npm run build` refuse un tiret long, une graphie interdite, un expert ou une étude de cas publiés sans autorisation, un article technique publié sans validation par un expert.

## Écrire un article (sans être développeur)

1. Aller sur https://agrielev-benin.netlify.app/admin/ et se connecter avec son compte GitHub (il faut avoir été invité sur le dépôt `smabdoulhack/agrielev-site`).
2. « Articles du blog » › « Nouvel article » : remplir titre, résumé, date, catégorie, photo de couverture et sa description, texte.
3. Choisir l'état « Brouillon » ou « Publié », puis enregistrer. Un article publié est en ligne environ 2 minutes plus tard.

Un article ne bloque jamais la mise en ligne : un tiret long est remplacé par une virgule, une graphie interdite (« Agrielev ») est seulement signalée dans les journaux de build Netlify.

### Mise en place de la connexion (une seule fois)

1. GitHub › Settings › Developer settings › OAuth Apps › New OAuth App : nom « AgriElev admin », Homepage URL `https://agrielev-benin.netlify.app`, Authorization callback URL `https://api.netlify.com/auth/done`. Créer, puis générer un « client secret ».
2. Netlify › projet `agrielev-benin` › Project configuration › Access & security › OAuth › Install provider › GitHub : coller le Client ID et le Client secret.
3. Inviter chaque rédacteur : GitHub › dépôt `agrielev-site` › Settings › Collaborators › Add people (droit d'écriture).

## Tests

    npm test             # Vitest
    npm run test:e2e     # Playwright (build avec l’article de test, preview sur le port 4322)

## Déploiement Netlify

1. Créer le dépôt GitHub au nom d'AgriElev Bénin SARL et y pousser `main`.
2. Sur Netlify (compte au nom de la SARL) : « Add new site », importer le dépôt. Build et publication sont lus dans `netlify.toml`.
3. Formulaires : Site configuration, Forms, activer « Form detection », puis redéployer. Vérifier que `contact` et `candidature-expert` apparaissent.
4. Notifications : Forms, Form notifications, ajouter une notification e-mail pour chaque formulaire vers l'adresse de réception choisie par la direction. L'objet de l'e-mail contient le sujet et le pôle (exemple : « Démonstration CuniSmart · Commercial »).
5. Statistiques : créer le site sur Umami Cloud, puis ajouter la variable d'environnement `PUBLIC_UMAMI_ID` dans Netlify et redéployer.
6. Domaine : Domain management, ajouter `agrielev.com` ; chez le registrar, créer les enregistrements DNS indiqués par Netlify ; rediriger `www` vers le domaine nu ; HTTPS est automatique.
7. Vérifier que les prévisualisations de branche renvoient l'en-tête `X-Robots-Tag: noindex` (`curl -sI <url de prévisualisation> | grep -i robots`).

## Avant la mise en ligne

- [ ] RCCM et siège vérifiés sur les documents officiels (`src/data/site.ts`).
- [ ] URL de l'application CuniSmart confirmée (`SITE.urlCuniSmart`).
- [ ] Lien du canal WhatsApp, pages Facebook et LinkedIn renseignés, ou laissés vides.
- [ ] Délai de réponse confirmé (`SITE.delaiReponse`).
- [ ] Statut réel de chaque offre, module, espèce et fonction confirmé par Abdoul Hack et Thierry Kouembi.
- [ ] Autorisations écrites des personnes photographiées (voir `src/assets/photos/SOURCES.md`).
- [ ] Experts : autorisation de citer obtenue avant de passer `etat: publie`.
- [ ] Formations : parcours confirmés avant publication.
- [ ] Textes légaux validés, puis bandeau « Texte à valider » retiré des trois pages légales.
- [ ] Logos vectoriels reçus et favicon régénéré si besoin (`node scripts/generer-images.mjs`).
- [ ] Notifications Netlify Forms testées avec un vrai envoi depuis la prévisualisation.
- [ ] Lighthouse mobile ≥ 90 sur la prévisualisation Netlify.
- [ ] Premier article du blog rédigé et publié, ou blog laissé avec son message d'attente.
