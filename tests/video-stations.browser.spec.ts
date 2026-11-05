import { test, expect } from '@playwright/test';

for (const locale of ['ar', 'en']) {
  test(`video stations use native flow without frame downloads (${locale})`, async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { configurable: true, value: { effectiveType: '4g', downlink: 10, saveData: false } }));
    const legacyRequests: string[] = [];
    page.on('request', request => {
      if (/Fed3_Frame_240|gsap|ScrollTrigger/.test(request.url())) legacyRequests.push(request.url());
    });
    await page.goto(`/${locale}/`);
    await expect(page.locator('[data-mode="video"]')).toBeVisible();
    for (const id of ['alternatives', 'home-cloud', 'communities']) {
      const station = page.locator(`#${id}`);
      await expect(station.getByRole('heading', { level: 2 })).toBeVisible();
      await expect(station.locator('[data-station-video]')).toBeVisible();
      await expect(station.locator('[data-station-video] img')).toHaveAttribute('src', `/videos/${id}-v1-poster.webp`);
    }
    await expect(page.locator('[data-terrain]')).toBeVisible();
    await expect(page.locator('[data-terrain]')).toHaveAttribute('data-renderer', 'webgl');
    await expect(page.locator('[data-terrain] canvas')).toHaveCount(1);
    await expect(page.locator('video')).toHaveCount(0);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: locale === 'ar' ? 'التنقّل' : 'Navigation', exact: true }).click();
    await page.locator('#main-navigation a[href="#communities"]').click();
    await expect.poll(() => page.locator('#communities').evaluate(el => Math.round(el.getBoundingClientRect().top))).toBeLessThan(160);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(legacyRequests).toEqual([]);
    await page.screenshot({ path: `test-results/video-stations-${locale}.png`, fullPage: true });
  });
}
