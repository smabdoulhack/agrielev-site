import { expect, test } from '@playwright/test';

test.describe('accueil', () => {
  test.beforeEach(async ({ page }) => { await page.goto('/'); });

  test('affiche la promesse et les deux actions principales', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Des outils et un accompagnement pour développer vos activités agricoles');
    await expect(page.getByRole('link', { name: 'Découvrir CuniSmart' }).first()).toHaveAttribute('href', '/cunismart');
    await expect(page.getByRole('link', { name: 'Échanger sur un projet' })).toHaveAttribute('href', '/contact');
  });

  test('oriente les quatre profils', async ({ page }) => {
    const profils = page.locator('[data-test="acces-profil"]');
    await expect(profils).toHaveCount(4);
    await expect(profils.nth(0)).toHaveAttribute('href', '/cunismart');
    await expect(profils.nth(1)).toHaveAttribute('href', '/cooperatives');
    await expect(profils.nth(2)).toHaveAttribute('href', /\/contact\?sujet=partenariat/);
    await expect(profils.nth(3)).toHaveAttribute('href', '/connect#candidature');
  });

  test('présente les cinq offres avec leur statut', async ({ page }) => {
    const offres = page.locator('[data-test="carte-offre"]');
    await expect(offres).toHaveCount(5);
    for (let i = 0; i < 5; i++) await expect(offres.nth(i).locator('.badge')).toBeVisible();
  });

  test('propose une démonstration CuniSmart', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Demander une démonstration' })).toHaveAttribute('href', /sujet=demo-cunismart/);
  });

  test('masque les sections sans contenu publié', async ({ page }) => {
    // Au lancement, études de cas et experts sont en brouillon. Les articles sont testés en Task 10.
    await expect(page.getByRole('heading', { name: 'Sur le terrain' })).toHaveCount(0);
    await expect(page.locator('[data-test="carte-expert"]')).toHaveCount(0);
  });

  test('déclare l’organisation en données structurées', async ({ page }) => {
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(JSON.parse(jsonLd ?? '{}')['@type']).toBe('Organization');
  });
});
