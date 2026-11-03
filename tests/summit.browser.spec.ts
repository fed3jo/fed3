import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('fed3-locale', location.pathname.startsWith('/en') ? 'en' : 'ar');
    sessionStorage.setItem('fed3-mode', 'simple');
  });
});

test('the masthead is available at the summit and floats when the page scrolls', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/ar/');
  await expect(page.locator('[data-entered]')).toHaveAttribute('data-entered', 'true');
  const header = page.locator('header');
  await expect(header).toHaveAttribute('data-floating', 'false');
  await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(header.locator('img')).toHaveAttribute('src', /fed3-logo\.svg/);
  await expect(page.getByRole('img', { name: /جبل السيادة الرقمية/ })).toBeVisible();
  await expect(page.locator('[data-terrain]')).toHaveAttribute('data-renderer', 'webgl');
  await expect(page.locator('#identity-heading')).toHaveText('افهم خياراتك الرقمية');
  await page.evaluate(() => window.scrollTo({ top: 200, behavior: 'instant' }));
  await expect(header).toHaveAttribute('data-floating', 'true');
  await expect(header).toHaveCSS('border-top-left-radius', '100px');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(header).toHaveAttribute('data-floating', 'false');
  await page.getByRole('button', { name: 'ابدأ رحلتك', exact: true }).click();
  await expect(page.locator('#alternatives-heading')).toBeInViewport();
  expect(errors).toEqual([]);
});

test('mobile navigation opens at the top and reaches the selected chapter', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ar/');
  await expect(page.locator('[data-entered]')).toHaveAttribute('data-entered', 'true');
  await page.getByRole('button', { name: 'التنقّل', exact: true }).click();
  await expect(page.locator('#main-navigation')).toBeVisible();
  await page.locator('#main-navigation').getByRole('link', { name: 'المجتمعات الرقمية', exact: true }).click();
  await expect(page.locator('#communities-heading')).toBeInViewport();
  await expect(page.getByRole('button', { name: 'التنقّل', exact: true })).toHaveAttribute('aria-expanded', 'false');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('both languages preserve the flag and all navigation without motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['ar', 'en']) {
    await page.goto(`/${locale}/`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('[data-terrain]')).toHaveAttribute('data-renderer', 'webgl');
    await expect(page.locator('[data-terrain]')).toHaveAttribute('data-motion', 'reduced');
    await expect(page.getByRole('img', { name: /Digital Navy/ })).toBeVisible();
    await expect(page.locator('header')).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('the summit and navigation remain readable before JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(`${process.env.TEST_BASE_URL || 'http://127.0.0.1:3000'}/ar/`);
  await expect(page.locator('#identity-heading')).toHaveText('افهم خياراتك الرقمية');
  await expect(page.getByRole('img', { name: /جبل السيادة الرقمية/ })).toBeVisible();
  await expect(page.locator('header').getByRole('link', { name: 'Switch to English' })).toBeVisible();
  await context.close();
});

test('the terrain keeps its controls separate from the visible overview at narrow sizes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/ar/');
    await expect(page.locator('[data-entered]')).toHaveAttribute('data-entered', 'true');
    await expect(page.locator('[data-terrain]')).toHaveAttribute('data-renderer', 'webgl');
    await expect(page.locator('[data-wind-station], [data-mountain] a, [data-mountain] button, [data-mountain] img')).toHaveCount(0);
    await expect(page.getByRole('img', { name: /Digital Navy/ })).toBeVisible();
    await expect(page.locator('#identity-heading')).toBeInViewport({ratio:1});
    await expect(page.locator('[data-initiative-identity]')).not.toContainText('بياناتك.');
    await expect(page.locator('[data-initiative-identity] img')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('context loss preserves the particle mountain and its summit motto', async ({ page }) => {
  await page.goto('/ar/');
  await expect(page.locator('[data-entered]')).toHaveAttribute('data-entered', 'true');
  await expect(page.locator('[data-terrain]')).toHaveAttribute('data-renderer', 'webgl');
  await page.locator('[data-terrain] canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await expect(page.locator('[data-terrain]')).toHaveAttribute('data-renderer', 'fallback');
  const preview = page.locator('[data-particle-preview] img');
  await expect(preview).toBeVisible();
  await expect(preview).toHaveAttribute('alt', /بياناتك. قرارك!/);
  await expect(preview).toHaveAttribute('src', /particles\/desktop-ar.webp/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(preview).toBeVisible();
});
