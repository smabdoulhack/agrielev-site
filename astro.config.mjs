import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://agrielev.com',
  trailingSlash: 'ignore',
  // Astro 7 compresse par défaut selon les règles JSX, qui suppriment l'espace entre
  // un texte et une balise placée à la ligne. On garde la compression HTML classique.
  compressHTML: true,
  integrations: [
    sitemap({ filter: (page) => !page.includes('/contact/merci') }),
  ],
});
