import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { chargerVisibles } from '../lib/collections.ts';

export async function GET(context: APIContext) {
  const articles = (await chargerVisibles('articles')).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return rss({
    title: 'Blog AgriElev',
    description: "Actualités d'AgriElev, conseils techniques, filières et marchés, retours de terrain.",
    site: context.site!,
    customData: '<language>fr-fr</language>',
    items: articles.map((a) => ({
      title: a.data.titre,
      description: a.data.resume,
      pubDate: a.data.date,
      link: `/blog/${a.id}/`,
      categories: [a.data.categorie, ...a.data.etiquettes],
    })),
  });
}
