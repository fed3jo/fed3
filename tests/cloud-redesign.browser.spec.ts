import { expect, test } from '@playwright/test';

test('cloud introduction shares the site composition and respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const locale of ['ar', 'en']) {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto(`/${locale}/home-cloud/`);
    await expect(page.locator('[data-intro-variant="cloud"]')).toBeVisible();
    await expect(page.locator('h1')).toHaveText(locale === 'ar' ? 'السحابة المحلية' : 'Your local cloud');
    await expect(page.locator('[data-intro-variant="cloud"] video')).toHaveAttribute('poster', '/videos/cloud-intro-v1-poster.webp');
    await expect(page.locator('[data-intro-variant="cloud"] video')).not.toHaveAttribute('src', /.+/);
    await page.screenshot({ path: `test-results/cloud-redesign-hero-${locale}.png` });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.getByRole('button', { name: locale === 'ar' ? 'اكتشف السحابة' : 'Explore local cloud', exact: true }).click();
    await expect(page.locator('#cloud-overview')).toBeFocused();
    await expect(page).toHaveURL(/#cloud-overview$/);
    await page.locator('#cloud-overview').screenshot({ path: `test-results/cloud-redesign-overview-${locale}.png` });
    await page.screenshot({ path: `test-results/cloud-redesign-full-${locale}.png`, fullPage: true });
  }
  expect(errors).toEqual([]);
});

test('access modes and expandable technical details remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['ar', 'en']) {
    await page.goto(`/${locale}/home-cloud/`);
    const modes = page.getByRole('group', { name: locale === 'ar' ? 'طريقة الوصول' : 'Access method' });
    for (let i = 0; i < 3; i++) {
      await modes.getByRole('button').nth(i).click();
      await expect(modes.getByRole('button').nth(i)).toHaveAttribute('aria-pressed', 'true');
    }
    await expect(page.locator('#cloud-flow [role="status"]')).toContainText('HTTPS');
    const hardware = page.locator('[data-cloud-requirements] details');
    await expect(hardware).not.toHaveAttribute('open');
    await hardware.locator('summary').click();
    await expect(hardware.locator('table')).toBeVisible();
    await expect(hardware.locator('table')).toContainText('4 GB RAM');
    const steps = page.locator('#cloud-steps ol>li');
    await expect(steps).toHaveCount(6);
    await expect(steps.nth(4).locator('details p')).toBeHidden();
    await steps.nth(4).locator('summary').click();
    await expect(steps.nth(4).locator('details p')).toContainText(locale === 'ar' ? 'قاعدة البيانات' : 'database');
    await expect(steps.nth(4).locator('a')).toHaveAttribute('href', /maintenance\/backup/);
    const daily = page.locator('[data-cloud-daily] details');
    await expect(daily).toHaveCount(5);
    await daily.nth(2).locator('summary').click();
    await expect(daily.nth(2).locator('p')).toBeVisible();
    const readiness = page.locator('#cloud-readiness>details');
    await expect(readiness).not.toHaveAttribute('open');
    await readiness.locator(':scope>summary').click();
    await expect(readiness).toHaveAttribute('open', '');
  }
});

test('cloud layouts fit small screens and section links focus their targets', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['ar', 'en']) {
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/${locale}/home-cloud/`);
      await expect(page.locator('[data-intro-variant="cloud"] video')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width === 390) await page.screenshot({ path: `test-results/cloud-redesign-mobile-${locale}.png`, fullPage: true });
      await page.getByRole('button', { name: locale === 'ar' ? 'التنقّل' : 'Navigation', exact: true }).click();
      await page.locator('#cloud-navigation a[href="#cloud-readiness"]').click();
      await expect(page.locator('#cloud-readiness')).toBeFocused();
      await expect(page.getByRole('button', { name: locale === 'ar' ? 'التنقّل' : 'Navigation', exact: true })).toHaveAttribute('aria-expanded', 'false');
      await page.locator('[data-cloud-requirements] details>summary').click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});
