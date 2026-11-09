// Ligne éditoriale du blog : une icône, une phrase et une photo de terrain par catégorie (src/lib/blog.ts).
// Fichier préfixé par « _ » : Astro ne le publie pas comme une page.
import type { CategorieCode } from '../../lib/blog.ts';
import { PHOTOS, type PhotoSite } from '../../data/photos.ts';

export const RUBRIQUES: Record<CategorieCode, { icone: string; texte: string; photo: PhotoSite }> = {
  actualites: { icone: 'newspaper', texte: 'Les nouvelles d’AgriElev, de CuniSmart et de nos programmes.', photo: PHOTOS.equipeTerrain },
  'conseils-techniques': { icone: 'first-aid-kit', texte: 'Élevage, cultures et santé animale : des pratiques expliquées simplement.', photo: PHOTOS.suiviPastoral },
  'filieres-marches': { icone: 'chart-line-up', texte: 'Prix, débouchés et organisation des filières agricoles.', photo: PHOTOS.karite },
  terrain: { icone: 'map-trifold', texte: 'Ce que nous voyons lors de nos missions auprès des producteurs.', photo: PHOTOS.reunionProducteurs },
};
