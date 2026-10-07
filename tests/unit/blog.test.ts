import { describe, expect, it } from 'vitest';
import { articlesLies, libelleCategorie, tempsLecture, trierParDate } from '../../src/lib/blog.ts';

const a = (id: string, categorie: 'actualites' | 'conseils-techniques' | 'terrain', jour: number) => ({
  id, categorie, date: new Date(2026, 9, jour),
});

describe('blog', () => {
  it('estime le temps de lecture à 200 mots par minute, minimum 1', () => {
    expect(tempsLecture('')).toBe(1);
    expect(tempsLecture('mot '.repeat(199))).toBe(1);
    expect(tempsLecture('mot '.repeat(401))).toBe(3);
  });

  it('donne le libellé de catégorie', () => {
    expect(libelleCategorie('conseils-techniques')).toBe('Conseils techniques');
  });

  it('trie du plus récent au plus ancien', () => {
    expect(trierParDate([a('x', 'terrain', 1), a('y', 'terrain', 5)]).map((i) => i.id)).toEqual(['y', 'x']);
  });

  it('propose d’abord la même catégorie, puis les plus récents, sans l’article courant', () => {
    const courant = a('c', 'conseils-techniques', 10);
    const tous = [
      courant,
      a('ancien-meme', 'conseils-techniques', 1),
      a('recent-autre', 'actualites', 9),
      a('recent-meme', 'conseils-techniques', 8),
      a('vieux-autre', 'terrain', 2),
    ];
    expect(articlesLies(courant, tous).map((i) => i.id)).toEqual(['recent-meme', 'ancien-meme', 'recent-autre']);
  });

  it('renvoie moins de 3 articles s’il n’y en a pas assez', () => {
    const courant = a('c', 'terrain', 1);
    expect(articlesLies(courant, [courant])).toEqual([]);
  });
});
