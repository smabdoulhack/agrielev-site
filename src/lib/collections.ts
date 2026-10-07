import { getCollection, type CollectionEntry } from 'astro:content';
import { filtrerVisibles } from './contenu.ts';

type AvecEtat = 'offres' | 'experts' | 'etudes' | 'formations' | 'documents' | 'articles';

// Brouillons visibles en développement, jamais dans le build de production.
export async function chargerVisibles<C extends AvecEtat>(nom: C): Promise<CollectionEntry<C>[]> {
  const entrees = (await getCollection(nom)) as CollectionEntry<C>[];
  return filtrerVisibles(entrees as { data: { etat: string } }[], import.meta.env.PROD) as CollectionEntry<C>[];
}
