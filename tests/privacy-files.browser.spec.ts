import { expect, test } from '@playwright/test';

test('compact image cards have decoded artwork, product cases, and working detail links', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['ar', 'en']) {
    await page.goto(`/${locale}/#privacy-files`);
    const section = page.locator('[data-privacy-files]');
    const carousel = page.locator('[data-privacy-carousel]');
    await carousel.scrollIntoViewIfNeeded();
    const current = carousel.locator('article[aria-hidden=false]');
    const next = carousel.getByRole('button', { name: locale === 'ar' ? 'الملف التالي' : 'Next file', exact: true });
    const seen: string[] = [];
    for (let i = 0; i < 7; i++) {
      seen.push((await current.getAttribute('data-privacy-file'))!);
      await expect.poll(() => current.locator('img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
      expect((await current.innerText()).trim().split(/\s+/).length).toBeLessThan(45);
      await expect(current.locator('a')).toHaveAttribute('href', new RegExp(`/${locale}/privacy-files/`));
      await next.click();
    }
    expect(seen).toContain('whatsapp-transparency');
    expect(seen).toContain('instagram-children');
    expect(seen).toContain('facebook-ftc');
    await expect(current).toHaveAttribute('data-privacy-file', 'meta-new-mexico');
    await current.locator('a').click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/privacy-files/meta-new-mexico/`));
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main a[href*="nmdoj.gov"]')).toBeVisible();
    await expect(page.locator('main a[href*="sec.gov"]')).toBeVisible();
    await page.goBack();
    await expect(section).toBeVisible();
    await section.getByRole('button', { name: locale === 'ar' ? 'ميتا' : 'Meta', exact: true }).click();
    await expect(carousel.locator('article')).toHaveCount(5);
    await next.click();
    await expect(current).toHaveAttribute('data-privacy-file', 'whatsapp-transparency');
    await next.press('ArrowRight');
    await expect(current).toHaveAttribute('data-privacy-file', 'instagram-children');
    const policies = page.locator('[data-privacy-policies]');
    await expect(policies.locator('[data-policy]')).toHaveCount(3);
    for (const company of ['meta', 'google', 'microsoft']) {
      const policy = policies.locator(`[data-policy=${company}]`);
      await policy.scrollIntoViewIfNeeded();
      await expect.poll(() => policy.locator('img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
      await expect(policy).toHaveAttribute('href', `/${locale}/privacy-files/policy-${company}/`);
    }
    await policies.locator('[data-policy=google]').click();
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main a[href*="policies.google.com"]')).toBeVisible();
    await page.screenshot({ path: `test-results/privacy-policy-${locale}.png`, fullPage: true });
    await page.goto(`/${locale}/#privacy-files`);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.locator('[data-privacy-carousel]').scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const compact = page.locator('[data-privacy-carousel]');
      const bounds = (await compact.boundingBox())!;
      expect(bounds.height).toBeLessThan(470);
      const previous = (await compact.getByRole('button', { name: locale === 'ar' ? 'الملف السابق' : 'Previous file', exact: true }).boundingBox())!;
      const forward = (await compact.getByRole('button', { name: locale === 'ar' ? 'الملف التالي' : 'Next file', exact: true }).boundingBox())!;
      expect(previous.x - bounds.x).toBeLessThan(20);
      expect(bounds.x + bounds.width - forward.x - forward.width).toBeLessThan(20);
      expect(Math.abs(previous.y - forward.y)).toBeLessThan(2);
      for (let i = 0; i < 7; i++) {
        const article = compact.locator('article[aria-hidden=false]');
        const articleBounds = (await article.boundingBox())!;
        const linkBounds = (await article.locator('a').boundingBox())!;
        expect(linkBounds.y + linkBounds.height).toBeLessThanOrEqual(articleBounds.y + articleBounds.height);
        await compact.getByRole('button', { name: locale === 'ar' ? 'الملف التالي' : 'Next file', exact: true }).click();
      }
    }
  }
  expect(errors).toEqual([]);
});

test('rotation, mouse dragging, pause and reduced motion work with the shorter carousel', async ({ page }) => {
  await page.clock.install();
  await page.goto('/ar/');
  const carousel = page.locator('[data-privacy-carousel]');
  await carousel.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const current = carousel.locator('article[aria-hidden=false]');
  await expect(carousel.locator('[data-running=true]')).toHaveCount(1);
  await page.clock.fastForward(9_100);
  await expect(current).toHaveAttribute('data-privacy-file', 'whatsapp-transparency');
  await carousel.getByRole('button', { name: 'إيقاف التبديل التلقائي' }).click();
  await page.clock.fastForward(18_100);
  await expect(current).toHaveAttribute('data-privacy-file', 'whatsapp-transparency');
  await carousel.getByRole('button', { name: 'تشغيل التبديل التلقائي' }).click();
  await page.mouse.move(0, 0);
  await expect(carousel.locator('[data-running=true]')).toHaveCount(1);
  await page.clock.fastForward(9_100);
  await expect(current).toHaveAttribute('data-privacy-file', 'instagram-children');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(carousel.locator('[data-running=true]')).toHaveCount(0);
  await page.clock.fastForward(18_100);
  await expect(current).toHaveAttribute('data-privacy-file', 'instagram-children');
  await page.setViewportSize({ width: 390, height: 844 });
  await carousel.scrollIntoViewIfNeeded();
  const slides = page.locator('[data-privacy-carousel] > div').first().locator('[data-dragging]');
  const bounds = (await slides.boundingBox())!;
  await page.mouse.move(bounds.x + 80, bounds.y + 115);
  await page.mouse.down();
  await page.mouse.move(bounds.x + 220, bounds.y + 115, { steps: 8 });
  await expect(slides).toHaveAttribute('data-dragging', 'true');
  await page.mouse.up();
  await expect(current).toHaveAttribute('data-privacy-file', 'google-location');
});

test('finger swipes change files, vertical swipes scroll, and cancelled drags keep the current file', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/ar/#privacy-files');
  const carousel = page.locator('[data-privacy-carousel]');
  await carousel.scrollIntoViewIfNeeded();
  const current = carousel.locator('article[aria-hidden=false]');
  const bounds = (await carousel.boundingBox())!;
  const cdp = await context.newCDPSession(page);
  const swipe = async (dx: number, dy: number, cancel = false) => {
    const x = bounds.x + 90;
    const y = bounds.y + 145;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
    for (let step = 1; step <= 8; step++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * step / 8, y: y + dy * step / 8, id: 1 }] });
    }
    await cdp.send('Input.dispatchTouchEvent', { type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: [] });
  };
  await swipe(150, 0);
  await expect(current).toHaveAttribute('data-privacy-file', 'whatsapp-transparency');
  await swipe(120, 0, true);
  await expect(current).toHaveAttribute('data-privacy-file', 'whatsapp-transparency');
  const before = await page.evaluate(() => scrollY);
  await swipe(0, -120);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 30);
  await expect(current).toHaveAttribute('data-privacy-file', 'whatsapp-transparency');
  await context.close();
});

test('new Meta product files show the regulator and appeal status without implying access to encrypted messages', async ({ page }) => {
  for (const slug of ['whatsapp-transparency', 'instagram-children']) {
    await page.goto(`/ar/privacy-files/${slug}/`);
    await expect(page.locator('main a[href*="dataprotection.ie"]')).toHaveCount(2);
    await expect(page.getByText('غرامة تنظيمية · قيد الاستئناف', { exact: true })).toBeVisible();
    await expect.poll(() => page.locator('main img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  }
  await page.goto('/ar/privacy-files/microsoft-xbox/');
  await expect.poll(() => page.locator('main img').evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});
