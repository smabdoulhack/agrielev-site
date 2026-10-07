import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  use: { baseURL: 'http://localhost:4322' },
  webServer: {
    command: 'ARTICLES_EXEMPLE=1 npm run build && npx astro preview --port 4322 --ignore-lock',
    url: 'http://localhost:4322',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    // Plus petit écran visé par la spec (360 px) : structure commune et absence de défilement horizontal.
    { name: 'petit-ecran', testMatch: /structure\.spec\.ts/, use: { ...devices['Pixel 7'], viewport: { width: 360, height: 740 } } },
    { name: 'ordinateur', use: { ...devices['Desktop Chrome'] } },
  ],
});
