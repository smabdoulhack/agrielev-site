import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const EMPLACEMENTS = [
  'accueil-ouverture', 'offre-gestion-numerique', 'offre-formation',
  'offre-transformation', 'offre-marches', 'offre-innovation', 'entreprise', 'cooperatives',
  'connect', 'blog-defaut', 'contact', 'ressources', 'page-introuvable', 'merci', 'legal', 'eleveur',
  // Prises de vue reprises du site en ligne agrielev.com (novembre 2026).
  'terrain-reunion', 'suivi-pastoral', 'equipe-terrain', 'maraichage', 'papayers', 'ananas-biodigesteur',
  'cheptel-bovin', 'karite', 'conditionnement-recoltes', 'parcelle-biodigesteur', 'reunion-producteurs',
];

describe('photos', () => {
  it('chaque emplacement a son fichier', () => {
    for (const e of EMPLACEMENTS) expect(existsSync(`src/assets/photos/${e}.jpg`), e).toBe(true);
  });

  it('chaque photo a un texte alternatif non vide dans photos.ts', () => {
    const source = readFileSync('src/data/photos.ts', 'utf8');
    for (const e of EMPLACEMENTS) expect(source, e).toContain(`/photos/${e}.jpg'`);
    const alts = [...source.matchAll(/alt: '([^']*)'/g)].map((m) => m[1]);
    expect(alts).toHaveLength(EMPLACEMENTS.length);
    for (const alt of alts) {
      expect(alt.length).toBeGreaterThan(15);
      expect(alt, 'texte alternatif encore à rédiger').not.toMatch(/Description factuelle/);
    }
  });
});
