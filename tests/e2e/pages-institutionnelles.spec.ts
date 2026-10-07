import { expect, test } from '@playwright/test';

test('entreprise : présentation, mission et vision', async ({ page }) => {
  await page.goto('/entreprise');
  await expect(page.getByRole('heading', { name: 'Notre mission' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notre vision' })).toBeVisible();
  await expect(page.getByText('11 juillet 2026')).toBeVisible();
  await expect(page.getByText('usages déclarés', { exact: false })).toBeVisible();
});

test('solutions : cinq offres ancrées avec actions préremplies', async ({ page }) => {
  await page.goto('/solutions');
  for (const id of ['gestion-numerique', 'formation-expertise', 'transformation', 'marches', 'innovation']) {
    await expect(page.locator(`section#${id}`)).toHaveCount(1);
  }
  await expect(page.locator('#gestion-numerique').getByRole('link', { name: 'Organiser un pilote avec ma coopérative' }))
    .toHaveAttribute('href', '/contact?sujet=pilote-cooperative&depuis=%2Fsolutions%23gestion-numerique');
  await expect(page.locator('[data-test="module"]')).toHaveCount(11);
});

test('cunismart : signature, fonctions avec statut, démonstration', async ({ page }) => {
  await page.goto('/cunismart');
  await expect(page.locator('h1')).toHaveText('CuniSmart by AgriElev');
  await expect(page.locator('[data-test="fonction"] .badge')).toHaveCount(9);
  await expect(page.getByRole('heading', { name: 'Couverture collective' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Demander une démonstration' })).toHaveAttribute('href', /sujet=demo-cunismart/);
});

test('coopératives : parcours en cinq étapes et pilote', async ({ page }) => {
  await page.goto('/cooperatives');
  await expect(page.locator('ol.parcours > li')).toHaveCount(5);
  await expect(page.getByRole('link', { name: 'Organiser un pilote avec ma coopérative' }).first())
    .toHaveAttribute('href', /sujet=pilote-cooperative/);
});
