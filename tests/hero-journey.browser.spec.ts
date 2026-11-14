import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { configurable: true, value: { effectiveType: '4g', downlink: 10, saveData: false } }));
});

for (const locale of ['ar', 'en']) test(`the seamless hero film autoplays, contains all chapters and loops (${locale})`, async ({ page }) => {
  await page.goto(`/${locale}/`);
  const journey = page.locator('[data-hero-journey]');
  const video = journey.locator('video');
  await expect(journey.getByRole('button')).toHaveCount(0);
  await expect(video).toHaveAttribute('src', '/videos/fed3-hero-journey-v1-720p.mp4');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0);
  expect(await video.evaluate((v: HTMLVideoElement) => ({ duration: v.duration, muted: v.muted, loop: v.loop, inline: v.playsInline, controls: v.controls })))
    .toEqual({ duration: 12, muted: true, loop: true, inline: true, controls: false });
  await expect(video).toHaveCSS('border-top-width', '0px');
  await expect(video).toHaveCSS('border-radius', '0px');
  await expect(video).toHaveCSS('box-shadow', 'none');
  await expect(video).toHaveCSS('object-fit', 'contain');
  for (const time of [4.5, 8.5]) {
    await video.evaluate((v: HTMLVideoElement, t) => { v.currentTime = t; }, time);
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(time);
    await expect(video).toHaveAttribute('src', '/videos/fed3-hero-journey-v1-720p.mp4');
  }
  await video.evaluate((v: HTMLVideoElement) => { v.currentTime = 11.85; });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime < 1 && !v.paused)).toBe(true);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
});

test('scrolling pauses the hero, settling resumes it, and leaving the hero keeps it paused', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/ar/');
  const video = page.locator('[data-hero-journey] video');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(.2);
  await page.mouse.move(300, 400);
  await page.mouse.wheel(0, 60);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  const stoppedAt = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(stoppedAt);
  await page.locator('#communities').evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.waitForTimeout(350);
  expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
});

test('mobile uses the small rendition and resumes automatically without controls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/ar/');
  const journey = page.locator('[data-hero-journey]');
  const video = journey.locator('video');
  await expect(video).toHaveAttribute('src', '/videos/fed3-hero-journey-v1-360p.mp4');
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0);
  await expect(journey.getByRole('button')).toHaveCount(0);
  await page.mouse.wheel(0, 50);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('reduced motion shows the poster and playback follows the motion preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/');
  const journey = page.locator('[data-hero-journey]');
  const video = journey.locator('video');
  await expect(video).not.toHaveAttribute('src', /.+/);
  await expect(video).toHaveAttribute('poster', '/videos/fed3-hero-journey-v1-poster.webp');
  await expect(journey.getByRole('button')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
});

test('failed loading retains the poster without controls', async ({ page }) => {
  await page.route('**/fed3-hero-journey-v1-720p.mp4', route => route.abort());
  await page.goto('/en/');
  const journey = page.locator('[data-hero-journey]');
  await expect(journey.locator('img')).toBeVisible();
  await expect(journey.getByRole('button')).toHaveCount(0);
  await expect(journey.locator('video')).toHaveCount(0);
});
