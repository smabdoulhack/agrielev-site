import type { ImageMetadata } from 'astro';
import accueilOuverture from '../assets/photos/accueil-ouverture.jpg';
import accueilCunismart from '../assets/photos/accueil-cunismart.jpg';
import offreGestionNumerique from '../assets/photos/offre-gestion-numerique.jpg';
import offreFormation from '../assets/photos/offre-formation.jpg';
import offreTransformation from '../assets/photos/offre-transformation.jpg';
import offreMarches from '../assets/photos/offre-marches.jpg';
import offreInnovation from '../assets/photos/offre-innovation.jpg';
import entreprise from '../assets/photos/entreprise.jpg';
import cooperatives from '../assets/photos/cooperatives.jpg';
import connect from '../assets/photos/connect.jpg';
import blogDefaut from '../assets/photos/blog-defaut.jpg';
import contact from '../assets/photos/contact.jpg';
import ressources from '../assets/photos/ressources.jpg';

export interface PhotoSite {
  src: ImageMetadata;
  alt: string;
}

export const PHOTOS = {
  accueilOuverture: { src: accueilOuverture, alt: 'Troupeau de zébus blancs au pâturage dans une savane verdoyante, sous un ciel nuageux' },
  accueilCunismart: { src: accueilCunismart, alt: 'Un éleveur tend la main vers ses bovins qui broutent au bord d’une piste en terre rouge' },
  offreGestionNumerique: { src: offreGestionNumerique, alt: 'Zébus tachetés noir et blanc traversant une piste en terre' },
  offreFormation: { src: offreFormation, alt: 'Un membre de l’équipe AgriElev en gilet orange échange avec des habitants assis sur des nattes' },
  offreTransformation: { src: offreTransformation, alt: 'Une productrice présente un bol de noix de karité et un bloc de beurre de karité' },
  offreMarches: { src: offreMarches, alt: 'Un manutentionnaire range des sacs de produits agricoles dans un camion' },
  offreInnovation: { src: offreInnovation, alt: 'Panneau « Biodigesteur » devant une parcelle d’ananas et un bâtiment en briques' },
  entreprise: { src: entreprise, alt: 'Quatre membres de l’équipe AgriElev en gilets de sécurité posent devant une parcelle' },
  cooperatives: { src: cooperatives, alt: 'Réunion communautaire : des habitants assis sur des nattes échangent avec l’équipe AgriElev' },
  connect: { src: connect, alt: 'Un homme en tenue traditionnelle rayée présente le feuillage d’un arbre' },
  blogDefaut: { src: blogDefaut, alt: 'Champ d’ananas en lisière d’une forêt' },
  contact: { src: contact, alt: 'Parcelles de maraîchage avec des rangs de choux en périphérie urbaine' },
  ressources: { src: ressources, alt: 'Un maraîcher travaille entre des planches de légumes' },
} satisfies Record<string, PhotoSite>;

export type CleePhoto = keyof typeof PHOTOS;
