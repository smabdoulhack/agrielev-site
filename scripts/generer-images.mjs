// Génère favicon, icône Apple et image de partage par défaut à partir du logo.
// Le logo source est un JPEG à fond blanc : on recadre l'icône et on arrondit ses coins
// (transparence) pour qu'aucun coin blanc n'apparaisse sur fond crème.
import sharp from 'sharp';

const LOGO = 'src/assets/logo-agrielev.jpg';
const ICONE = { left: 9, top: 9, width: 238, height: 238 };
const RAYON = 56;
const CREME = { r: 242, g: 237, b: 217 };

const masque = Buffer.from(
  `<svg width="${ICONE.width}" height="${ICONE.height}"><rect width="100%" height="100%" rx="${RAYON}" ry="${RAYON}"/></svg>`,
);
const icone = await sharp(LOGO)
  .extract(ICONE)
  .composite([{ input: masque, blend: 'dest-in' }])
  .png()
  .toBuffer();

// Icône détourée pour l'en-tête et le pied de page (servie en 1x, 2x et 3x par astro:assets).
await sharp(icone).png().toFile('src/assets/logo-agrielev.png');
await sharp(icone).resize(64, 64).png().toFile('public/favicon.png');
await sharp(icone).resize(180, 180).png().toFile('public/apple-touch-icon.png');

const logoPartage = await sharp(icone).resize(260, 260).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: CREME } })
  .composite([{ input: logoPartage, gravity: 'center' }])
  .jpeg({ quality: 85 })
  .toFile('public/og-defaut.jpg');

console.log('logo-agrielev.png (src/assets), favicon.png, apple-touch-icon.png et og-defaut.jpg (public/) générés');
