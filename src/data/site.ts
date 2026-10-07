// Coordonnées et paramètres du site. Les valeurs marquées « à vérifier » figurent
// dans la liste « Avant la mise en ligne » du README.
export const SITE = {
  url: 'https://agrielev.com',
  nom: 'AgriElev',
  raisonSociale: 'AgriElev Bénin SARL',
  signature: 'Agriculture africaine, intelligence, données, performance',
  description:
    'AgriElev associe gestion numérique, formation et expertise de terrain pour accompagner les producteurs et leurs organisations.',
  capital: '1 000 000 FCFA',
  rccm: 'RB/AB/26 B 12041', // à vérifier sur l'extrait RCCM
  ifu: '3202656451548',
  siege: 'Abomey-Calavi, Bénin', // à vérifier (Arconville, Abomey-Calavi, ou Cotonou)
  telephones: ['01 48 17 81 81', '+229 01 90 11 39 15'],
  email: 'hello@cunismart.com',
  delaiReponse: 'sous trois jours ouvrés', // à confirmer par la direction
  urlCuniSmart: 'https://v2-cunismart.agrielev.com/',
  whatsapp: '', // lien du canal de diffusion WhatsApp ; bloc masqué tant que vide
  facebook: '',
  linkedin: '',
  dateLancementCuniSmart: new Date(2026, 6, 11),
} as const;

export const NAVIGATION: { libelle: string; href: string }[] = [
  { libelle: 'AgriElev', href: '/entreprise' },
  { libelle: 'Nos solutions', href: '/solutions' },
  { libelle: 'Coopératives', href: '/cooperatives' },
  { libelle: 'AgriElev Connect', href: '/connect' },
  { libelle: 'Blog', href: '/blog' },
  { libelle: 'Ressources', href: '/ressources' },
  { libelle: 'Contact', href: '/contact' },
];

export function telLien(numero: string): string {
  const chiffres = numero.replace(/[^\d+]/g, '');
  return `tel:${chiffres.startsWith('+') ? chiffres : `+229${chiffres}`}`;
}
