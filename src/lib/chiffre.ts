import { formatNombre } from './format.ts';

// Charte, section 7 : aucun chiffre sans valeur, unité, année et source.
export interface DonneeChiffree {
  valeur: number | string;
  unite: string;
  annee: number;
  source: string;
}

const CHAMPS: (keyof DonneeChiffree)[] = ['valeur', 'unite', 'annee', 'source'];

export function preparerChiffre(d: Partial<DonneeChiffree>): { valeur: string; unite: string; mention: string } | null {
  const manquants = CHAMPS.filter((c) => d[c] === undefined || d[c] === '');
  if (manquants.length) {
    console.warn(`Chiffre non affiché, champ(s) manquant(s) : ${manquants.join(', ')}`);
    return null;
  }
  const valeur = typeof d.valeur === 'number' ? formatNombre(d.valeur) : String(d.valeur);
  return { valeur, unite: d.unite!, mention: `${d.annee}, source : ${d.source}` };
}
