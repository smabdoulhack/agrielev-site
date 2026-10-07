import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import {
  schemaArticle, schemaDocument, schemaEtudeDeCas, schemaExpert, schemaFormation, schemaModule, schemaOffre,
} from './lib/schemas.ts';

const yaml = (dossier: string) => glob({ pattern: '*.yaml', base: `./src/content/${dossier}` });

export const collections = {
  offres: defineCollection({ loader: yaml('offres'), schema: ({ image }) => schemaOffre(image) }),
  modules: defineCollection({ loader: file('src/content/modules.yaml'), schema: schemaModule }),
  experts: defineCollection({ loader: yaml('experts'), schema: ({ image }) => schemaExpert(image) }),
  etudes: defineCollection({ loader: yaml('etudes-de-cas'), schema: ({ image }) => schemaEtudeDeCas(image) }),
  formations: defineCollection({ loader: yaml('formations'), schema: schemaFormation }),
  documents: defineCollection({ loader: yaml('documents'), schema: schemaDocument }),
  articles: defineCollection({
    // exemple-test.md est un article publié réservé aux tests e2e (ARTICLES_EXEMPLE=1).
    loader: glob({
      pattern: process.env.ARTICLES_EXEMPLE === '1' ? '*.md' : ['*.md', '!exemple-test.md'],
      base: './src/content/articles',
    }),
    schema: ({ image }) => schemaArticle(image),
  }),
};
