import type { ImageMetadata } from 'astro';
import accueilOuverture from '../assets/photos/accueil-ouverture.jpg';
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
import pageIntrouvable from '../assets/photos/page-introuvable.jpg';
import merci from '../assets/photos/merci.jpg';
import eleveur from '../assets/photos/eleveur.jpg';
import legal from '../assets/photos/legal.jpg';
import terrainReunion from '../assets/photos/terrain-reunion.jpg';
import suiviPastoral from '../assets/photos/suivi-pastoral.jpg';
import equipeTerrain from '../assets/photos/equipe-terrain.jpg';
import maraichage from '../assets/photos/maraichage.jpg';
import papayers from '../assets/photos/papayers.jpg';
import ananasBiodigesteur from '../assets/photos/ananas-biodigesteur.jpg';
import cheptelBovin from '../assets/photos/cheptel-bovin.jpg';
import karite from '../assets/photos/karite.jpg';
import arbreTerrain from '../assets/photos/conditionnement-recoltes.jpg';
import parcelleBiodigesteur from '../assets/photos/parcelle-biodigesteur.jpg';
import reunionProducteurs from '../assets/photos/reunion-producteurs.jpg';

export interface PhotoSite {
  src: ImageMetadata;
  alt: string;
  /** Point de cadrage (object-position) quand la photo est recadrée. */
  position?: string;
}

export const PHOTOS = {
  accueilOuverture: { src: accueilOuverture, alt: 'Un technicien AgriElev échange avec des productrices assises sur des nattes, lors d’une réunion de village', position: '50% 70%' },
  offreGestionNumerique: { src: offreGestionNumerique, alt: 'Zébus tachetés noir et blanc traversant une piste en terre' },
  offreFormation: { src: offreFormation, alt: 'Quatre membres de l’équipe AgriElev en gilets de sécurité, sur le terrain', position: '50% 35%' },
  offreTransformation: { src: offreTransformation, alt: 'Une productrice présente un bol de noix de karité et un bloc de beurre de karité', position: '50% 60%' },
  offreMarches: { src: offreMarches, alt: 'Un manutentionnaire range des sacs de produits agricoles dans un camion', position: '50% 55%' },
  offreInnovation: { src: offreInnovation, alt: 'Panneau « Biodigesteur » devant une parcelle d’ananas et un bâtiment en briques' },
  entreprise: { src: entreprise, alt: 'Quatre membres de l’équipe AgriElev en gilets de sécurité posent devant une parcelle', position: '50% 35%' },
  cooperatives: { src: cooperatives, alt: 'Un membre de l’équipe AgriElev en gilet orange échange avec des habitantes assises sur des nattes', position: '40% 50%' },
  connect: { src: connect, alt: 'Un homme en tenue traditionnelle rayée présente le feuillage d’un arbre', position: '50% 30%' },
  blogDefaut: { src: blogDefaut, alt: 'Champ d’ananas en lisière d’une forêt' },
  contact: { src: contact, alt: 'Un troupeau de zébus avance sur une piste en terre rouge bordée de hautes herbes', position: '50% 60%' },
  ressources: { src: ressources, alt: 'Un maraîcher travaille entre des planches de légumes', position: '50% 20%' },
  pageIntrouvable: { src: pageIntrouvable, alt: 'Une piste en terre rouge traverse la savane, des zébus au loin' },
  eleveur: { src: eleveur, alt: 'Un éleveur tend la main vers ses bovins qui broutent au bord d’une piste en terre rouge', position: '35% 50%' },
  merci: { src: merci, alt: 'Troupeau de zébus blancs au pâturage dans une savane verdoyante' },
  legal: { src: legal, alt: 'Parcelle d’ananas en lisière de forêt' },
  // Photos du site agrielev.com en ligne (mêmes prises de vue, novembre 2026).
  terrainReunion: { src: terrainReunion, alt: 'Un technicien AgriElev en gilet orange échange avec une productrice assise sur une natte, devant un groupe d’habitants du village', position: '50% 62%' },
  suiviPastoral: { src: suiviPastoral, alt: 'Un membre de l’équipe AgriElev observe un troupeau de zébus blancs au bord d’une piste en terre', position: '45% 50%' },
  equipeTerrain: { src: equipeTerrain, alt: 'Quatre membres de l’équipe AgriElev en gilets de sécurité posent devant une parcelle', position: '50% 30%' },
  maraichage: { src: maraichage, alt: 'Planches de choux et de jeunes plants maraîchers en bord de route' },
  papayers: { src: papayers, alt: 'Plantation de papayers en rangs serrés' },
  ananasBiodigesteur: { src: ananasBiodigesteur, alt: 'Panneau « Biodigesteur » devant une parcelle d’ananas et un bâtiment en briques', position: '30% 60%' },
  cheptelBovin: { src: cheptelBovin, alt: 'Zébus tachetés noir et blanc traversant une piste en terre' },
  karite: { src: karite, alt: 'Une productrice présente un bol de noix de karité et un bloc de beurre de karité', position: '65% 55%' },
  arbreTerrain: { src: arbreTerrain, alt: 'Un homme en tenue traditionnelle rayée présente le feuillage d’un arbre', position: '50% 35%' },
  parcelleBiodigesteur: { src: parcelleBiodigesteur, alt: 'Parcelle d’ananas devant le panneau du biodigesteur, en lisière de forêt', position: '50% 65%' },
  reunionProducteurs: { src: reunionProducteurs, alt: 'Un technicien AgriElev goûte une boisson offerte lors d’une réunion avec des productrices assises sur des nattes', position: '40% 45%' },
} satisfies Record<string, PhotoSite>;

export type CleePhoto = keyof typeof PHOTOS;
