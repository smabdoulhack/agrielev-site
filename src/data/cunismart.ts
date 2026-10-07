import type { Statut } from '../lib/statut.ts';

// Statuts à confirmer par Abdoul Hack avant la mise en ligne (spec, section 10).
// Source des listes : dossier communication du 4 octobre 2026, offre 1.
export const ESPECES: { nom: string; statut: Statut }[] = [
  { nom: 'Lapins', statut: 'preparation' },
  { nom: 'Porcs', statut: 'preparation' },
  { nom: 'Bovins', statut: 'preparation' },
  { nom: 'Chèvres', statut: 'preparation' },
  { nom: 'Poules', statut: 'preparation' },
  { nom: 'Moutons', statut: 'preparation' },
];

export const FONCTIONS: { nom: string; description: string; statut: Statut }[] = [
  { nom: 'Cheptel', description: 'Inventaire des animaux et suivi de leurs mouvements.', statut: 'preparation' },
  { nom: 'Reproduction', description: 'Saillies, mises bas et calendrier de reproduction.', statut: 'preparation' },
  { nom: 'Santé', description: 'Traitements, vaccinations et observations sanitaires.', statut: 'preparation' },
  { nom: 'Finances', description: 'Dépenses, ventes et résultats de l’exploitation.', statut: 'preparation' },
  { nom: 'Nutrition', description: 'Rations et consommation d’aliments.', statut: 'preparation' },
  { nom: 'Traçabilité', description: 'Historique de chaque animal et de chaque lot.', statut: 'preparation' },
  { nom: 'Mes Cultures', description: 'Suivi des parcelles et des campagnes de cultures.', statut: 'preparation' },
  { nom: 'Aquaculture', description: 'Suivi des bassins et des lots de poissons.', statut: 'preparation' },
  { nom: 'Recyclage', description: 'Valorisation des ressources organiques de l’exploitation.', statut: 'preparation' },
];
