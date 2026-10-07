import { expect, test } from '@playwright/test';

const OBJET_AUTRE = '[Site AgriElev] Autre demande · Institutionnel';

test('préremplit le sujet, le profil et la page d’origine', async ({ page }) => {
  await page.goto('/contact?sujet=demo-cunismart&profil=producteur&depuis=%2Fcunismart');
  await expect(page.locator('#c-sujet')).toHaveValue('demo-cunismart');
  await expect(page.locator('#c-profil')).toHaveValue('producteur');
  await expect(page.locator('input[name="depuis"]')).toHaveValue('/cunismart');
  await expect(page.locator('input[name="subject"]')).toHaveValue('[Site AgriElev] Démonstration CuniSmart · Commercial');
});

test('ignore un sujet inconnu sans casser le formulaire', async ({ page }) => {
  await page.goto('/contact?sujet=nimporte');
  await expect(page.locator('#c-sujet')).toHaveValue('');
  await expect(page.locator('input[name="subject"]')).toHaveValue(OBJET_AUTRE);
});

test("met à jour l'objet et l'événement statistique quand le sujet change", async ({ page }) => {
  await page.goto('/contact');
  await page.locator('#c-sujet').selectOption('presse');
  await expect(page.locator('input[name="subject"]')).toHaveValue('[Site AgriElev] Presse et médias · Institutionnel');
  await expect(page.getByRole('button', { name: 'Envoyer ma demande' })).toHaveAttribute('data-umami-event-sujet', 'presse');
});

async function remplir(page: import('@playwright/test').Page) {
  await page.locator('#c-sujet').selectOption('autre');
  await page.locator('#c-nom').fill('Awa Test');
  await page.locator('#c-profil').selectOption('producteur');
  await page.locator('#c-zone').fill('Abomey-Calavi');
  await page.locator('#c-message').fill('Bonjour, ceci est un test.');
  await page.locator('#c-consentement').check();
}

test('exige un e-mail ou un téléphone', async ({ page }) => {
  let envois = 0;
  await page.route('**/contact/merci/', (route) => { envois++; return route.fulfill({ status: 200, body: 'ok' }); });
  await page.goto('/contact');
  await remplir(page);
  await page.getByRole('button', { name: 'Envoyer ma demande' }).click();
  expect(await page.locator('#c-email').evaluate((el: HTMLInputElement) => el.validationMessage)).toContain('e-mail ou un numéro');
  expect(envois).toBe(0);
});

test('n’envoie qu’une fois malgré un double clic', async ({ page }) => {
  let envois = 0;
  await page.route('**/contact/merci/', async (route) => {
    envois++;
    await new Promise((r) => setTimeout(r, 1500));
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<h1>ok</h1>' });
  });
  await page.goto('/contact');
  await remplir(page);
  await page.locator('#c-telephone').fill('01 00 00 00 00');
  // Deux clics immédiats dans la page : click() de Playwright attendrait la navigation.
  const etat = await page.evaluate(() => {
    const bouton = document.querySelector<HTMLButtonElement>('form[name="contact"] button[type="submit"]')!;
    bouton.click();
    bouton.click();
    return { desactive: bouton.disabled, texte: bouton.textContent };
  });
  expect(etat).toEqual({ desactive: true, texte: 'Envoi en cours…' });
  await page.waitForURL('**/contact/merci/');
  expect(envois).toBe(1);
});

test.describe('sans JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('le formulaire reste utilisable en envoi natif', async ({ page }) => {
    await page.goto('/contact');
    const form = page.locator('form[name="contact"]');
    await expect(form).toHaveAttribute('method', 'POST');
    await expect(form).toHaveAttribute('action', '/contact/merci/');
    await expect(page.locator('input[name="subject"]')).toHaveValue(OBJET_AUTRE);
    await expect(page.getByRole('button', { name: 'Envoyer ma demande' })).toBeEnabled();
  });

  test('le menu mobile s’ouvre sans JavaScript', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'menu tiroir sur mobile uniquement');
    await page.goto('/');
    await page.locator('[data-test="ouvrir-menu"]').click();
    await expect(page.locator('#menu-mobile')).toBeVisible();
  });
});
