// Ordre et couleurs : charte graphique, section 5.
export const FAMILLES = ['animales', 'aquatiques', 'vegetales', 'produits', 'chaine'] as const;
export type Famille = (typeof FAMILLES)[number];

export const INFOS_FAMILLES: Record<Famille, { libelle: string; couleur: string }> = {
  animales: { libelle: 'Productions animales', couleur: '--mod-terracotta' },
  aquatiques: { libelle: 'Productions aquatiques', couleur: '--mod-bleu-lagune' },
  vegetales: { libelle: 'Productions végétales', couleur: '--mod-vert-pousse' },
  produits: { libelle: 'Produits', couleur: '--ae-or-recolte' },
  chaine: { libelle: 'Chaîne de valeur', couleur: '--ae-brun-terre' },
};

export function trierParFamille<T extends { famille: Famille; ordre: number }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => FAMILLES.indexOf(a.famille) - FAMILLES.indexOf(b.famille) || a.ordre - b.ordre,
  );
}
