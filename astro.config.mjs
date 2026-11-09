import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { espacesInsecables } from './src/lib/typographie.ts';
import { partagerIcones } from './src/lib/icones-partagees.ts';

// Après la compilation : espaces insécables de la typographie française dans le texte des pages,
// puis icônes répétées décrites une seule fois par page (pages plus légères).
function typographieFrancaise() {
  return {
    name: 'typographie-francaise',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const racine = fileURLToPath(dir);
        const fichiers = (await readdir(racine, { recursive: true })).filter((f) => f.endsWith('.html') && !f.startsWith('admin'));
        for (const f of fichiers) {
          const chemin = join(racine, f);
          const html = await readFile(chemin, 'utf8');
          const corrige = partagerIcones(espacesInsecables(html));
          if (corrige !== html) await writeFile(chemin, corrige);
        }
      },
    },
  };
}

export default defineConfig({
  site: 'https://agrielev.com',
  trailingSlash: 'ignore',
  // Astro 7 compresse par défaut selon les règles JSX, qui suppriment l'espace entre
  // un texte et une balise placée à la ligne. On garde la compression HTML classique.
  compressHTML: true,
  integrations: [
    sitemap({ filter: (page) => !page.includes('/contact/merci') }),
    typographieFrancaise(),
  ],
});
