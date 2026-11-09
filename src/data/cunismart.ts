import type { Statut } from '../lib/statut.ts';

// Statuts confirmés par Abdoul Hack le 2026-11-08 : CuniSmart est « en pilote »,
// gratuit pendant le pilote. Contenus alignés sur le site produit cunismart.com.

export const STATUT_CUNISMART: Statut = 'pilote';

/** Espèces dont l'élevage est suivi (parcours CuniMaster par filière). */
export const ESPECES: { nom: string; statut: Statut }[] = [
  { nom: 'Lapins', statut: 'pilote' },
  { nom: 'Poules pondeuses', statut: 'pilote' },
  { nom: 'Porcs', statut: 'pilote' },
  { nom: 'Chèvres', statut: 'pilote' },
  { nom: 'Bovins', statut: 'pilote' },
  { nom: 'Moutons', statut: 'pilote' },
];

export interface Fonction {
  nom: string;
  icone: string;
  description: string;
  statut: Statut;
}

/** Les métiers de l'exploitation, chacun compté dans son unité. */
export const METIERS: Fonction[] = [
  { nom: 'Élevage', icone: 'cow', statut: 'pilote', description: 'Vos bêtes une par une ou en bande. Les soins avec les rappels de vaccins, la reproduction de la saillie au sevrage, les pesées, les ventes et les pertes.' },
  { nom: 'Transformation', icone: 'factory', statut: 'pilote', description: 'Lait, karité, néré, soja, manioc : la collecte, la production et son rendement, les ventes, le stock et les ventes à crédit à encaisser.' },
  { nom: 'Cultures', icone: 'plant', statut: 'pilote', description: 'Vos terres et leurs saisons. Le calendrier des travaux, les récoltes en sacs ou en bassines converties en kilos, la marge par culture.' },
  { nom: 'Aquaculture', icone: 'fish', statut: 'pilote', description: 'Vos bassins, les mises en charge par espèce, les pesées, les pertes et les récoltes. Une alerte quand les pertes sortent de l’ordinaire.' },
  { nom: 'Recyclage', icone: 'recycle', statut: 'pilote', description: 'La collecte des matières en lots pesés, les tournées du collecteur et les livraisons au repreneur.' },
];

/** Fonctions communes à tous les métiers. */
export const POUR_TOUS: Fonction[] = [
  { nom: 'Finances', icone: 'chart-line-up', statut: 'pilote', description: 'Ce qui rentre, ce qui sort, ce qu’on vous doit et ce que vous devez, mois par mois.' },
  { nom: 'Relevé d’activité', icone: 'file-text', statut: 'pilote', description: 'Un document à imprimer ou à enregistrer en PDF, que vous remettez vous-même à qui vous voulez.' },
  { nom: 'QR code des produits', icone: 'qr-code', statut: 'pilote', description: 'Un acheteur le scanne et lit l’origine du lot, signée par CuniSmart.' },
  { nom: 'CuniMaster', icone: 'graduation-cap', statut: 'pilote', description: 'Des leçons et leurs quiz par filière, qui s’ouvrent sans réseau.' },
];

/** Fonctionnement sans réseau, en trois temps. */
export const SANS_RESEAU: { titre: string; texte: string }[] = [
  { titre: 'Vous notez', texte: 'Au champ, à l’atelier ou au bord du bassin, sur votre téléphone.' },
  { titre: 'Pas de réseau', texte: 'Le téléphone garde votre saisie. Vous continuez à travailler.' },
  { titre: 'Le réseau revient', texte: 'Tout part tout seul, dans l’ordre et sans doublon.' },
];

/** Ce qui rend l'application utilisable sur le terrain. */
export const FAIT_POUR_ICI: { titre: string; texte: string }[] = [
  { titre: 'Votre numéro de téléphone suffit', texte: 'On se connecte avec son numéro, sans adresse e-mail.' },
  { titre: 'Un pictogramme et un mot par geste', texte: 'De gros boutons, lisibles en plein soleil, en français.' },
  { titre: 'Sans magasin d’applications', texte: 'CuniSmart s’ouvre dans le navigateur du téléphone (Android ou iPhone) et s’installe depuis lui.' },
  { titre: 'Pas de téléphone ? Le technicien s’en charge', texte: 'Le technicien de votre coopérative peut tenir votre cahier pour vous.' },
];
