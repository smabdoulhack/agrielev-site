export const STATUTS = ['disponible', 'pilote', 'preparation'] as const;
export type Statut = (typeof STATUTS)[number];

const LIBELLES: Record<Statut, string> = {
  disponible: 'Disponible',
  pilote: 'En pilote',
  preparation: 'En préparation',
};

export function libelleStatut(s: Statut): string {
  return LIBELLES[s];
}
