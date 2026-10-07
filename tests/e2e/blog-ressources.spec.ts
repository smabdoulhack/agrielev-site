import { expect, test } from '@playwright/test';

test('liste du blog avec filtres par catégorie', async ({ page }) => {
  await page.goto('/blog');
  await expect(page.locator('h1')).toHaveText('Blog');
  const filtres = page.getByRole('navigation', { name: 'Catégories' });
  for (const nom of ['Tous', 'Actualités AgriElev', 'Conseils techniques', 'Filières et marchés', 'Terrain']) {
    await expect(filtres.getByRole('link', { name: nom })).toBeVisible();
  }
  // Le nombre d'articles varie avec les publications : on vérifie la présence de l'article de test.
  await expect(page.locator('[data-test="carte-article"]', { hasText: "Article d'exemple pour les tests" })).toHaveCount(1);
});

test('catégorie vide : message d’attente', async ({ page }) => {
  await page.goto('/blog/categorie/conseils-techniques');
  await expect(page.locator('[data-test="carte-article"]')).toHaveCount(0);
  await expect(page.getByText('Aucun article publié dans cette catégorie pour le moment.')).toBeVisible();
});

test('page article : méta, sources, partage, brouillon absent', async ({ page }) => {
  await page.goto('/blog/exemple-test');
  await expect(page.locator('h1')).toHaveText("Article d'exemple pour les tests");
  await expect(page.getByText('1 min de lecture')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible();
  await expect(page.getByRole('link', { name: /WhatsApp/ })).toHaveAttribute('href', /wa\.me/);
  const brouillon = await page.request.get('/blog/site-agrielev-en-ligne');
  expect(brouillon.status()).toBe(404);
});

test('flux RSS', async ({ request }) => {
  const rss = await request.get('/rss.xml');
  expect(rss.status()).toBe(200);
  // L'apostrophe peut être échappée en &apos; (XML valide).
  expect(await rss.text()).toMatch(/<title>Article d(&apos;|')exemple pour les tests<\/title>/);
});

test('ressources : sections avec états vides', async ({ page }) => {
  await page.goto('/ressources');
  await expect(page.locator('#etudes-de-cas')).toContainText('Les premières études de cas seront publiées');
  await expect(page.locator('#formations')).toContainText('Les parcours de formation seront présentés');
  await expect(page.getByRole('link', { name: 'Lire le blog' })).toHaveAttribute('href', '/blog');
});

test('accueil : les derniers articles publiés apparaissent', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Derniers articles' })).toBeVisible();
  const cartes = page.locator('[data-test="carte-article"]');
  expect(await cartes.count()).toBeGreaterThanOrEqual(1);
  expect(await cartes.count()).toBeLessThanOrEqual(3);
});

test('connect : radio, téléexpertise en préparation, candidature', async ({ page }) => {
  await page.goto('/connect');
  await expect(page.getByText('Téléexpertise')).toBeVisible();
  await expect(page.locator('form[name="candidature-expert"]')).toBeVisible();
});
