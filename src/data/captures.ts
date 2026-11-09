import type { ImageMetadata } from 'astro';
import accueil from '../assets/cunismart/app-accueil.webp';
import aFaire from '../assets/cunismart/app-a-faire.webp';
import soins from '../assets/cunismart/app-soins.webp';
import cultures from '../assets/cunismart/app-cultures.webp';
import cunimaster from '../assets/cunismart/app-cunimaster.webp';
import cooperative from '../assets/cunismart/app-cooperative.webp';
import territoire from '../assets/cunismart/app-territoire.webp';

// Captures réelles de CuniSmart, issues du jeu de démonstration (noms fictifs).
// Source : cunismart.com, site produit d'AgriElev Bénin SARL.
export interface Capture {
  src: ImageMetadata;
  alt: string;
  legende: string;
}

export const CAPTURES = {
  accueil: { src: accueil, alt: 'Écran d’accueil de CuniSmart : les activités de la ferme (élevage, transformation, cultures, recyclage, aquaculture) en gros boutons', legende: 'L’accueil : les activités de la ferme' },
  aFaire: { src: aFaire, alt: 'Écran « À faire » de CuniSmart : soins en retard, reproduction à suivre, ventes à encaisser', legende: 'À faire : les soins en retard passent devant' },
  soins: { src: soins, alt: 'Registre des soins de CuniSmart : vaccinations, déparasitages et désinfections, avec produit et coût', legende: 'Le registre des soins, bête par bête' },
  cultures: { src: cultures, alt: 'Écran Cultures de CuniSmart : superficie emblavée, production récoltée et superficie par culture', legende: 'Vos cultures, saison par saison' },
  cunimaster: { src: cunimaster, alt: 'Écran CuniMaster : leçons par filière d’élevage et de cultures, niveaux de formation', legende: 'CuniMaster : les leçons par filière' },
  cooperative: { src: cooperative, alt: 'Écran coopérative de CuniSmart : exploitations, participation des membres et exploitations sans saisie', legende: 'La vue d’ensemble de la coopérative' },
  territoire: { src: territoire, alt: 'Écran des statistiques par territoire de CuniSmart, avec export CSV', legende: 'Les statistiques par territoire' },
} satisfies Record<string, Capture>;

export const MENTION_CAPTURES = 'Captures réelles, issues du jeu de démonstration (noms fictifs).';
