import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1, timeout: 45_000,
  expect: { timeout: 10_000 }, reporter: 'list',
  use: { baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:3000', channel: 'chrome', headless: true, viewport: { width: 1440, height: 900 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  projects: [
    { name: 'unit', testMatch: '**/*.unit.spec.ts', outputDir: 'test-results/unit' },
    { name: 'chromium', testMatch: '**/*.browser.spec.ts', outputDir: 'test-results/browser' },
  ],
});
