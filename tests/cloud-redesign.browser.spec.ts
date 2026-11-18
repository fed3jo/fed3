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

test('the sample file shows the server and separate backup before the install tutorial', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['ar', 'en']) {
    await page.goto(`/${locale}/home-cloud/`);
    const flow = page.locator('#cloud-flow');
    const story = flow.locator('[data-file-phase]');
    await story.getByRole('button').click();
    await expect(story).toHaveAttribute('data-file-phase', '2');
    await story.getByRole('button').click();
    await expect(story).toHaveAttribute('data-file-phase', '3');
    await expect(story.getByRole('status')).toContainText(locale === 'ar' ? 'قرص منفصل' : 'separate drive');
    await flow.locator('summary').click();
    const modes = page.getByRole('group', { name: locale === 'ar' ? 'طريقة الوصول' : 'Access method' });
    for (let i = 0; i < 3; i++) {
      await modes.getByRole('button').nth(i).click();
      await expect(modes.getByRole('button').nth(i)).toHaveAttribute('aria-pressed', 'true');
    }
    await expect(flow.locator('details [role="status"]')).toContainText('HTTPS');
    const hardware = page.locator('[data-cloud-requirements] table');
    await expect(hardware).toBeVisible();
    await expect(hardware).toContainText('2 GB RAM');
    await expect(hardware).toContainText('4 GB RAM');
    const steps = page.locator('#cloud-trial ol>li');
    await expect(steps).toHaveCount(5);
    await steps.nth(1).getByRole('button').click();
    await expect(page.locator('#cloud-trial code')).toContainText(['sudo apt update', 'sudo snap install nextcloud', 'snap changes nextcloud']);
    await steps.nth(3).getByRole('button').click();
    await expect(page.locator('#cloud-trial img')).toHaveAttribute('src', /nextcloud-upload\.webp$/);
    const daily = page.locator('[data-cloud-daily] details');
    await expect(daily).toHaveCount(5);
    await page.locator('details:has(> [data-cloud-daily]) > summary').click();
    await daily.nth(2).locator('summary').click();
    await expect(daily.nth(2).locator('p')).toBeVisible();
    await page.locator('[data-cloud-guide-hero] a[href="#cloud-readiness"]').click();
    await expect(page.locator('#cloud-readiness')).toBeFocused();
    await expect(page).toHaveURL(/#cloud-readiness$/);
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
      await expect(page.locator('[data-cloud-requirements] table')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});
