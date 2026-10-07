// Vérifie les textes du site avant chaque build : `npm run verifier`.
// Pages, composants et données : tiret long et graphies interdites bloquent le build.
// Articles du blog : jamais bloquants ; tiret long corrigé dans le fichier, graphies signalées.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { verifierArticle, verifierTexte, type Probleme } from '../src/lib/verifier.ts';

const EXTENSIONS = ['.astro', '.md', '.yaml', '.ts'];
const IGNORES = ['src/lib/verifier.ts'];
const ARTICLES = 'src/content/articles/';

function fichiers(dossier: string): string[] {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) return fichiers(chemin);
    return EXTENSIONS.some((ext) => nom.endsWith(ext)) ? [chemin] : [];
  });
}

const problemes: Probleme[] = [];
for (const f of fichiers('src').filter((f) => !IGNORES.includes(f))) {
  const texte = readFileSync(f, 'utf8');
  if (f.startsWith(ARTICLES)) {
    const r = verifierArticle(texte, f);
    if (r.corrections) {
      writeFileSync(f, r.texte);
      console.log(`${f} : ${r.corrections} tiret(s) long(s) remplacé(s) par une virgule.`);
    }
    for (const a of r.avertissements) console.warn(`Avertissement ${a.fichier}:${a.ligne}  ${a.message}`);
  } else {
    problemes.push(...verifierTexte(texte, f));
  }
}

for (const p of problemes) console.error(`${p.fichier}:${p.ligne}  ${p.message}`);
if (problemes.length) {
  console.error(`\n${problemes.length} problème(s) de rédaction. Corriger avant de compiler.`);
  process.exit(1);
}
console.log('Contenu conforme (tiret long, graphies).');
