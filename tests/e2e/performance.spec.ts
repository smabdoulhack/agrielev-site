import { expect, test } from '@playwright/test';

test('accueil : moins de 200 Ko transférés hors images', async ({ page }) => {
  let octets = 0;
  page.on('response', async (reponse) => {
    const type = reponse.request().resourceType();
    if (type === 'image') return;
    const corps = await reponse.body().catch(() => Buffer.alloc(0));
    octets += corps.length;
  });
  await page.goto('/', { waitUntil: 'networkidle' });
  expect(octets).toBeLessThan(200 * 1024);
});

test('accueil : pas de JavaScript bloquant ni de framework client', async ({ page }) => {
  await page.goto('/');
  const scripts = await page.locator('script[src]').evaluateAll((els) => els.map((e) => e.getAttribute('src')));
  expect(scripts.filter((s) => s && /react|vue|svelte/i.test(s))).toEqual([]);
});
