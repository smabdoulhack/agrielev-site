// Copie les icônes Phosphor « Regular » utilisées par le site vers src/icones/.
// Ajouter un nom ici puis lancer `npm run icones` pour en utiliser une nouvelle.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';

const NOMS = [
  // Modules (charte, section 5)
  'cow', 'rabbit', 'bird', 'fish', 'plant', 'egg', 'grains', 'package', 'truck', 'factory', 'storefront',
  // Interface
  'arrow-right', 'arrow-up-right', 'list', 'x', 'user', 'users-three', 'handshake', 'graduation-cap',
  'chat-circle-text', 'whatsapp-logo', 'facebook-logo', 'linkedin-logo', 'link-simple', 'envelope-simple',
  'phone', 'map-pin', 'radio', 'file-pdf', 'check-circle', 'calendar-blank', 'clock', 'lightbulb',
  'chart-line-up', 'device-mobile', 'leaf', 'recycle',
];

const source = 'node_modules/@phosphor-icons/core/assets/regular';
mkdirSync('src/icones', { recursive: true });
const manquantes = NOMS.filter((nom) => !existsSync(`${source}/${nom}.svg`));
if (manquantes.length) {
  console.error(`Icônes introuvables dans Phosphor : ${manquantes.join(', ')}`);
  process.exit(1);
}
for (const nom of NOMS) copyFileSync(`${source}/${nom}.svg`, `src/icones/${nom}.svg`);
console.log(`${NOMS.length} icônes copiées dans src/icones/`);
