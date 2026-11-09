import { expect, test } from '@playwright/test';
import { PAGES } from './pages';

for (const chemin of PAGES) {
  test(`structure commune : ${chemin}`, async ({ page }) => {
    const reponse = await page.goto(chemin);
    expect(reponse?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);
    const cunismart = page.locator('header [data-test="bouton-cunismart"]').first();
    await expect(cunismart).toBeVisible();
    await expect(cunismart).toHaveAttribute('target', '_blank');
    // Régression : l'icône du bouton était écrasée à 0 px dans le conteneur flex.
    expect(await cunismart.locator('svg').evaluate((e) => e.getBoundingClientRect().width)).toBeGreaterThan(0);
    await expect(page.locator('a.lien-evitement')).toHaveAttribute('href', '#contenu');
    // La CSP est portée par une balise meta (la page /admin, hors gabarit, n'y est pas soumise).
    await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute('content', /script-src 'self'/);
    const debordement = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(debordement).toBeLessThanOrEqual(0);
  });
}

test('le menu mobile s’ouvre et contient tous les liens', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'menu tiroir sur mobile uniquement');
  await page.goto('/');
  await page.locator('[data-test="ouvrir-menu"]').click();
  const menu = page.locator('#menu-mobile');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Contact' })).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Blog' })).toBeVisible();
});

// Régression : le logo était comprimé et recouvert par le premier lien du menu dès 1 280 px.
// La navigation complète s'affiche dès 1 280 px (en dessous : bouton de menu, comme sur agrielev.com).
for (const largeur of [1280, 1366, 1440, 1920]) {
  test(`en-tête sans chevauchement à ${largeur} px`, async ({ page, isMobile }) => {
    test.skip(isMobile, 'navigation complète sur ordinateur uniquement');
    await page.setViewportSize({ width: largeur, height: 900 });
    await page.goto('/entreprise');
    const logo = await page.locator('header .entete__barre > .entete__logo').boundingBox();
    const nav = page.locator('header .entete__nav');
    await expect(nav).toBeVisible();
    const liens = await nav.locator('a').evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: r.x, droite: r.right })));
    const bouton = await page.locator('header .entete__barre [data-test="bouton-cunismart"]').boundingBox();
    // Zone de protection du logo (charte, section 2) : au moins un quart de l'icône de 40 px.
    expect(liens[0].x - (logo!.x + logo!.width)).toBeGreaterThanOrEqual(10);
    expect(bouton!.x - liens[liens.length - 1].droite).toBeGreaterThanOrEqual(8);
    expect(logo!.width).toBeGreaterThanOrEqual(40);
  });
}

test('une adresse inconnue renvoie la page 404', async ({ page }) => {
  const reponse = await page.goto('/cette-page-nexiste-pas');
  expect(reponse?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Page introuvable');
});

test('la page /admin charge Sveltia CMS et n’est pas indexée', async ({ request }) => {
  const admin = await request.get('/admin/');
  expect(admin.status()).toBe(200);
  const html = await admin.text();
  expect(html).toContain('https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js');
  expect(html).toContain('noindex');
  const config = await request.get('/admin/config.yml');
  expect(config.status()).toBe(200);
  const texte = await config.text();
  for (const code of ['actualites', 'conseils-techniques', 'filieres-marches', 'terrain']) expect(texte).toContain(`value: ${code}`);
  expect(texte).toContain('repo: smabdoulhack/agrielev-site');
});
