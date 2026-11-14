import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('fed3-locale', location.pathname.startsWith('/en') ? 'en' : 'ar'); sessionStorage.setItem('fed3-mode','simple'); });
});

test('the first server-rendered view contains the overview and a journey poster without video downloads', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL: process.env.TEST_BASE_URL || 'http://127.0.0.1:3000' });
  const page = await context.newPage();
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  for (const [width, height] of [[1440, 900], [390, 844], [320, 740]]) {
    await page.setViewportSize({ width, height });
    await page.goto('/ar/');
    const intro = page.locator('[data-home-intro]');
    await expect(intro.locator('h1')).toBeVisible();
    await expect(intro.locator('[data-hero-empty-space]')).toBeVisible();
    await expect(intro.locator('video')).toHaveCount(1);
    await expect(intro.locator('video')).toHaveAttribute('poster', '/videos/fed3-hero-journey-v1-poster.webp');
    await expect(intro.locator('video')).not.toHaveAttribute('src', /.+/);
    await expect(intro.locator('canvas, iframe')).toHaveCount(0);
    await expect(page.locator('[data-terrain]')).toHaveCount(0);
  }
  expect(requests.some(url => /mountain|particle|\.mp4(?:\?|$)/.test(url))).toBe(false);
  await context.close();
});

test('the overview stays clear of the divider on desktop and mobile', async ({ page }) => {
  test.setTimeout(90_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['ar', 'en']) for (const [width, height] of [[1905,970],[1832,868],[1440,900],[1280,720],[1024,700],[768,1024],[390,844],[320,740],[844,390]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`/${locale}/`);
    await page.evaluate(() => document.fonts.ready);
    const identity = await page.locator('[data-initiative-identity]').boundingBox();
    const header = await page.locator('header').boundingBox();
    expect(identity!.y).toBeGreaterThanOrEqual(header!.y + header!.height + 12);
    expect(identity!.x).toBeGreaterThanOrEqual(0);
    expect(identity!.x + identity!.width).toBeLessThanOrEqual(width);
    await expect(page.locator('[data-hero-separator]:visible > path').first()).toHaveCSS('fill', 'rgb(6, 39, 89)');
    if (width > 900) {
      const dividerBounds = await page.locator('[data-hero-separator]:visible > path').last().evaluate(element => {
        const path = element as SVGPathElement;
        const matrix = path.getScreenCTM()!;
        const positions = Array.from({ length: 201 }, (_, i) => {
          const point = path.getPointAtLength(path.getTotalLength() * i / 200);
          return new DOMPoint(point.x, point.y).matrixTransform(matrix).x;
        });
        return { left: Math.min(...positions), right: Math.max(...positions) };
      });
      if (locale === 'ar') {
        expect(identity!.x).toBeGreaterThan(width / 2);
        expect(dividerBounds.right + 24).toBeLessThan(identity!.x);
      } else {
        expect(identity!.x + identity!.width).toBeLessThan(width / 2);
        expect(identity!.x + identity!.width + 24).toBeLessThan(dividerBounds.left);
      }
      const surface = await page.locator('[data-hero-empty-space]').boundingBox();
      expect(surface!.y).toBe(0);
    } else {
      const space = await page.locator('[data-hero-empty-space]').boundingBox();
      const action = await page.getByRole('button', { name: locale === 'ar' ? 'استكشف المحطات' : 'Explore the stations', exact: true }).boundingBox();
      expect(space!.y).toBeGreaterThan(action!.y + action!.height);
      expect(space!.width).toBeGreaterThanOrEqual(width - 1);
    }
    const action = page.getByRole('button', { name: locale === 'ar' ? 'استكشف المحطات' : 'Explore the stations', exact: true });
    await action.scrollIntoViewIfNeeded();
    await expect(action).toBeInViewport({ ratio: .99 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('the complete cloud picture and captions fit beside the copy on desktop', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  for (const [width,height] of [[1905,970],[1440,900],[1024,768]]) {
    await page.setViewportSize({width,height}); await page.goto('/ar/home-cloud/');
    const image=page.locator('[data-cloud-guide-hero] figure>img');
    await expect(image).toHaveCSS('object-fit','contain');
    await expect(image).toBeInViewport({ratio:1});
    await expect(page.locator('[data-cloud-guide-hero] figcaption')).toBeInViewport({ratio:1});
    expect(await image.evaluate(img=>img.getBoundingClientRect().bottom)).toBeLessThanOrEqual(height);
  }
});
