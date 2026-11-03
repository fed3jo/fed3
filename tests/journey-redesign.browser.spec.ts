import { test, expect } from '@playwright/test';

test('real sequence keeps a readable chapter through travel, reverses and exits normally', async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('fed3-locale', 'ar'));
  await page.goto('/ar/');
  await expect.poll(() => page.evaluate(() => Boolean(window.ScrollTrigger?.getById('fed3-sequence'))), { timeout: 45_000 }).toBe(true);
  await expect(page.locator('aside')).toHaveCount(0);
  for (const [p, station, expectedFrame] of [
    [.12, 'alternatives', null], [.27, 'alternatives', 60], [.37, 'alternatives', null],
    [.43, 'home-cloud', null], [.53, 'home-cloud', 120], [.63, 'home-cloud', null],
    [.7, 'communities', null], [.79, 'communities', 180], [.9, 'communities', null],
    [1, 'closing', 240], [.53, 'home-cloud', 120], [.27, 'alternatives', 60],
  ] as const) {
    await page.evaluate(progress => {
      const trigger = window.ScrollTrigger!.getById('fed3-sequence')!;
      const top = trigger.start + (trigger.end - trigger.start) * progress;
      if (window.fed3Lenis) window.fed3Lenis.scrollTo(top, { immediate: true });
      else window.scrollTo({ top, behavior: 'instant' });
    }, p);
    const visible = page.locator('section[data-station]:visible');
    await expect(visible).toHaveCount(1);
    await expect(visible).toHaveAttribute('data-station', station);
    await expect(visible.locator('h2')).toBeInViewport();
    if (expectedFrame) await expect(page.locator('canvas[data-frame]')).toHaveAttribute('data-frame', String(expectedFrame));
  }
  await page.screenshot({ path: 'test-results/redesign-journey-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => Boolean(window.ScrollTrigger?.getById('fed3-sequence')))).toBe(true);
  await page.evaluate(() => {
    const t = window.ScrollTrigger!.getById('fed3-sequence')!;
    window.fed3Lenis?.scrollTo(t.start + .53 * (t.end - t.start), { immediate: true });
  });
  await expect(page.locator('canvas[data-frame]')).toHaveAttribute('data-frame', '120');
  await expect(page.locator('#home-cloud h2')).toBeInViewport();
  await expect(page.locator('#home-cloud a')).toBeInViewport();
  await page.screenshot({ path: 'test-results/redesign-journey-mobile.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => { const t = window.ScrollTrigger!.getById('fed3-sequence')!; window.fed3Lenis?.scrollTo(t.end + 550, { immediate: true }); });
  await expect(page.locator('footer')).toBeInViewport();
  expect(errors).toEqual([]);
});

test('visual criteria, sources, app details and mobile navigation stay consistent', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['ar', 'en']) {
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto(`/${locale}/alternatives/?app=nextcloud#comparison`);
    const axes = page.locator('[data-comparison-criterion]');
    await axes.nth(8).click();
    await expect(axes.nth(8)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-comparison-explorer] h5')).toHaveText(['Google Drive', 'Nextcloud']);
    await expect(page.locator('[data-comparison-explorer] a[href^="https://"]').first()).toBeVisible();
    await page.locator('[data-comparison-explorer]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/redesign-axis-${locale}.png` });
    await page.goto(`/${locale}/apps/signal/`);
    await page.screenshot({ path: `test-results/redesign-app-${locale}.png`, fullPage: true });
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await page.locator('a[href="#app-comparison"]').click();
      await axes.nth(9).click();
      await expect(axes.nth(9)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[data-comparison-explorer] h4')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width === 390) await page.screenshot({ path: `test-results/redesign-app-mobile-${locale}.png`, fullPage: true });
    }
  }
});
