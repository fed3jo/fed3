import { expect, test } from '@playwright/test';

test('home wheel scroll eases, anchors settle below the header, and reduced motion stays native', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { configurable: true, value: { effectiveType: '3g', downlink: 1.6, saveData: false } }));
  await page.goto('/ar/');
  await expect.poll(() => page.evaluate(() => Boolean(window.fed3Lenis))).toBe(true);
  await page.mouse.move(100, 400);
  await page.evaluate(() => {
    const samples: number[] = [];
    Object.assign(window, { scrollSamples: samples });
    const begin = performance.now();
    const sample = () => { samples.push(scrollY); if (performance.now() - begin < 1400) requestAnimationFrame(sample); };
    requestAnimationFrame(sample);
  });
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(575);
  const samples = await page.evaluate(() => (window as Window & { scrollSamples?: number[] }).scrollSamples || []);
  expect(new Set(samples.map(Math.round)).size).toBeGreaterThan(8);
  expect(Math.max(...samples.slice(1).map((value, i) => value - samples[i]))).toBeLessThan(350);
  await page.locator('#main-navigation a[href="#communities"]').click();
  await expect.poll(() => page.locator('#communities').evaluate(el => Math.round(el.getBoundingClientRect().top))).toBeLessThan(140);
  await expect.poll(() => page.locator('#communities').evaluate(el => Math.round(el.getBoundingClientRect().top))).toBeGreaterThan(95);
  await page.locator('header a').first().click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(3);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.evaluate(() => Boolean(window.fed3Lenis))).toBe(false);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(450);
});
