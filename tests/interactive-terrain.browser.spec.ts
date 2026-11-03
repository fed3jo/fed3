import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('fed3-locale', location.pathname.startsWith('/en') ? 'en' : 'ar');
    sessionStorage.setItem('fed3-mode', 'simple');
  });
});

test('the home uses a native cursor and the plain stone background without security modes', async ({ page }) => {
  await page.goto('/ar/');
  const terrain = page.locator('[data-terrain]');
  await expect(terrain).toHaveAttribute('data-renderer', 'webgl');
  await page.mouse.move(490, 450);
  await expect(terrain).toHaveCSS('background-color', 'rgb(242, 239, 233)');
  await expect(terrain.locator('[class*=pointerArea]')).toHaveCSS('cursor', 'auto');
  await expect(page.getByRole('switch')).toHaveCount(0);
  await expect(terrain).not.toContainText('Tracking:');
  await expect(terrain).not.toContainText('Status: Encrypted');
  await expect(terrain.locator('[data-visible], [class*=backdrop]')).toHaveCount(0);
  await expect(page.locator('[data-initiative-identity]')).toContainText('افهم خياراتك الرقمية');
  await expect(page.locator('[data-initiative-identity] [data-logo-part]')).toHaveCount(0);
});

test('the start button reaches the first chapter after the identity section', async ({ page }) => {
  await page.goto('/en/');
  await page.getByRole('button', { name: 'Start your journey', exact: true }).click();
  await expect(page.locator('#alternatives-heading')).toBeInViewport();
});

test('the native touch surface and identity fit narrow screens', async ({ page }) => {
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/ar/');
    await expect(page.locator('[data-terrain]')).toHaveAttribute('data-renderer', 'webgl');
    await page.locator('[class*=pointerArea]').dispatchEvent('pointerdown', { clientX: width / 2, clientY: 400, pointerType: 'touch' });
    await expect(page.getByRole('switch')).toHaveCount(0);
    await page.locator('[data-initiative-identity]').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-initiative-identity]').getByRole('heading')).toBeInViewport({ratio:1});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('the scene animates, becomes still with reduced motion, and pauses off screen', async ({ page }) => {
  await page.goto('/ar/');
  const terrain = page.locator('[data-terrain]');
  await expect(terrain).toHaveAttribute('data-renderer', 'webgl');
  await page.evaluate(() => document.fonts.ready);
  const capture = () => page.screenshot({ clip: { x: 40, y: 230, width: 1300, height: 420 } });
  const moving = await capture(); await page.waitForTimeout(180);
  expect((await capture()).equals(moving)).toBe(false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(terrain).toHaveAttribute('data-motion', 'reduced');
  await page.waitForTimeout(180); const still = await capture(); await page.waitForTimeout(180);
  expect((await capture()).equals(still)).toBe(true);
  await page.evaluate(() => scrollTo({ top: 1300, behavior: 'instant' }));
  await expect(terrain).toHaveAttribute('data-active', 'false');
});

test('a lost WebGL context restores the mountain fallback', async ({ page }) => {
  await page.goto('/ar/');
  const terrain = page.locator('[data-terrain]');
  await expect(terrain).toHaveAttribute('data-renderer', 'webgl');
  await terrain.locator('canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await expect(terrain).toHaveAttribute('data-renderer', 'fallback');
  await expect(page.locator('[data-particle-preview] img')).toBeVisible();
  await expect(page.getByRole('img', { name: /Digital Navy/ })).toBeVisible();
});

test('spheres move away from a stationary pointer and return after it leaves', async ({ page }) => {
  await page.goto('/ar/');
  await expect(page.locator('[data-terrain]')).toHaveAttribute('data-renderer', 'webgl');
  const blueCoverage = async () => {
    const shot = await page.screenshot({ clip: { x: 440, y: 560, width: 120, height: 120 } });
    return page.evaluate(async base64 => {
      const image = new Image(); image.src = `data:image/png;base64,${base64}`; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
      const context = canvas.getContext('2d')!; context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, image.width, image.height).data;
      let blue = 0;
      for (let i = 0; i < pixels.length; i += 4) if (pixels[i] < 90 && pixels[i + 2] > pixels[i] * 1.4 && pixels[i + 2] > pixels[i + 1] * 1.1) blue++;
      return blue;
    }, shot.toString('base64'));
  };
  await page.mouse.move(10, 105); await page.waitForTimeout(1000); const original = await blueCoverage();
  await page.mouse.move(500, 620); await page.waitForTimeout(1300); const displaced = await blueCoverage();
  expect(displaced).toBeLessThan(original * .72);
  await page.mouse.move(10, 105); await page.waitForTimeout(1500); const returned = await blueCoverage();
  expect(returned).toBeGreaterThan(displaced * 1.3);
  expect(returned).toBeGreaterThan(original * .85);
});
