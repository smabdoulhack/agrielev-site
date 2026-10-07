export type Pole = 'commercial' | 'technique' | 'institutionnel';

export interface Sujet {
  code: string;
  libelle: string;
  pole: Pole;
}

export const LIBELLES_POLES: Record<Pole, string> = {
  commercial: 'Commercial',
  technique: 'Technique',
  institutionnel: 'Institutionnel',
};

// Ordre d'affichage dans la liste déroulante du formulaire.
export const SUJETS: readonly Sujet[] = [
  { code: 'demo-cunismart', libelle: 'Démonstration CuniSmart', pole: 'commercial' },
  { code: 'pilote-cooperative', libelle: 'Pilote avec ma coopérative', pole: 'commercial' },
  { code: 'proposer-produit', libelle: 'Proposer un produit', pole: 'commercial' },
  { code: 'besoin-achat', libelle: "Présenter un besoin d'achat", pole: 'commercial' },
  { code: 'besoin-transformation', libelle: 'Besoin en transformation', pole: 'commercial' },
  { code: 'probleme-technique', libelle: 'Problème technique CuniSmart', pole: 'technique' },
  { code: 'programme-developpeurs', libelle: 'Programme développeurs', pole: 'technique' },
  { code: 'proposer-experimentation', libelle: 'Proposer une expérimentation', pole: 'technique' },
  { code: 'institution', libelle: 'Institution ou collectivité', pole: 'institutionnel' },
  { code: 'partenariat', libelle: 'Partenariat', pole: 'institutionnel' },
  { code: 'presse', libelle: 'Presse et médias', pole: 'institutionnel' },
  { code: 'autre', libelle: 'Autre demande', pole: 'institutionnel' },
];

export const PROFILS: readonly { code: string; libelle: string }[] = [
  { code: 'producteur', libelle: 'Producteur ou productrice' },
  { code: 'cooperative', libelle: 'Coopérative ou organisation' },
  { code: 'partenaire', libelle: 'Partenaire ou institution' },
  { code: 'expert', libelle: 'Expert ou consultant' },
  { code: 'autre', libelle: 'Autre' },
];

export function trouverSujet(code: string | null | undefined): Sujet | undefined {
  if (!code) return undefined;
  return SUJETS.find((s) => s.code === code);
}

export function lienContact(sujet: string, depuis?: string, profil?: string): string {
  if (!trouverSujet(sujet)) throw new Error(`Sujet inconnu : ${sujet}`);
  const params = new URLSearchParams({ sujet });
  if (depuis) params.set('depuis', depuis);
  if (profil) params.set('profil', profil);
  return `/contact?${params.toString()}`;
}

export function objetEmail(code: string | null | undefined): string {
  const sujet = trouverSujet(code) ?? trouverSujet('autre')!;
  return `[Site AgriElev] ${sujet.libelle} · ${LIBELLES_POLES[sujet.pole]}`;
}
