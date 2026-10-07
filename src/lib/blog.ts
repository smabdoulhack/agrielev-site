export type CategorieCode = 'actualites' | 'conseils-techniques' | 'filieres-marches' | 'terrain';

export const CATEGORIES: readonly { code: CategorieCode; libelle: string }[] = [
  { code: 'actualites', libelle: 'Actualités AgriElev' },
  { code: 'conseils-techniques', libelle: 'Conseils techniques' },
  { code: 'filieres-marches', libelle: 'Filières et marchés' },
  { code: 'terrain', libelle: 'Terrain' },
];

export function libelleCategorie(code: CategorieCode): string {
  return CATEGORIES.find((c) => c.code === code)!.libelle;
}

export function tempsLecture(texte: string): number {
  const mots = texte.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(mots / 200));
}

export interface ArticleResume {
  id: string;
  categorie: CategorieCode;
  date: Date;
}

export function trierParDate<T extends { date: Date }>(items: T[]): T[] {
  return [...items].sort((x, y) => y.date.getTime() - x.date.getTime());
}

export function articlesLies<T extends ArticleResume>(courant: T, tous: T[], n = 3): T[] {
  const autres = trierParDate(tous.filter((t) => t.id !== courant.id));
  const memeCategorie = autres.filter((t) => t.categorie === courant.categorie);
  const reste = autres.filter((t) => t.categorie !== courant.categorie);
  return [...memeCategorie, ...reste].slice(0, n);
}
