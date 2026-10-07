import { describe, expect, it } from 'vitest';
import { libelleStatut } from '../../src/lib/statut.ts';
import { FAMILLES, INFOS_FAMILLES, trierParFamille } from '../../src/lib/familles.ts';

describe('statut', () => {
  it('donne un libellé lisible', () => {
    expect(libelleStatut('disponible')).toBe('Disponible');
    expect(libelleStatut('pilote')).toBe('En pilote');
    expect(libelleStatut('preparation')).toBe('En préparation');
  });
});

describe('familles', () => {
  it("suit l'ordre de la charte : production, produits, chaîne de valeur", () => {
    expect(FAMILLES).toEqual(['animales', 'aquatiques', 'vegetales', 'produits', 'chaine']);
  });

  it('associe la couleur d’accent de la charte', () => {
    expect(INFOS_FAMILLES.animales.couleur).toBe('--mod-terracotta');
    expect(INFOS_FAMILLES.aquatiques.couleur).toBe('--mod-bleu-lagune');
    expect(INFOS_FAMILLES.vegetales.couleur).toBe('--mod-vert-pousse');
    expect(INFOS_FAMILLES.produits.couleur).toBe('--ae-or-recolte');
    expect(INFOS_FAMILLES.chaine.couleur).toBe('--ae-brun-terre');
  });

  it('trie par famille puis par ordre', () => {
    const items = [
      { id: 'marches', famille: 'chaine' as const, ordre: 4 },
      { id: 'cultures', famille: 'vegetales' as const, ordre: 1 },
      { id: 'aviculture', famille: 'animales' as const, ordre: 3 },
      { id: 'elevage', famille: 'animales' as const, ordre: 1 },
    ];
    expect(trierParFamille(items).map((i) => i.id)).toEqual(['elevage', 'aviculture', 'cultures', 'marches']);
  });
});
