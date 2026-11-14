import { expect, test } from '@playwright/test';

for (const locale of ['ar', 'en']) {
  test(`the alternatives intro has a reduced-motion poster and the app carousel updates its source and comparison (${locale})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/alternatives/`);
    const hero = page.locator('[data-intro-variant="alternatives"]');
    await expect(hero.locator('h1')).toBeVisible();
    await expect(hero.locator('video')).toHaveCount(1);
    await expect(hero.locator('video')).toHaveAttribute('poster', '/videos/alternatives-hero-v1-poster.webp');
    await expect(hero.locator('video')).not.toHaveAttribute('src', /.+/);
    await expect(hero.locator('[data-hero-empty-space]')).toBeVisible();
    await hero.getByRole('button', { name: locale === 'ar' ? 'استكشف التطبيقات' : 'Explore the apps' }).click();
    await expect(page.locator('#catalog')).toBeFocused();
    const carousel = page.locator('[data-app-showcase]');
    const next = carousel.getByRole('button', { name: locale === 'ar' ? 'التطبيق التالي' : 'Next app', exact: true });
    const sources = ['https://signal.org/', 'https://brave.com/', 'https://proton.me/mail', 'https://nextcloud.com/files/', 'https://www.onlyoffice.com/desktop'];
    const ids = ['signal', 'brave', 'proton-mail', 'nextcloud', 'onlyoffice'];
    for (let index = 0; index < ids.length; index++) {
      await expect(carousel).toHaveAttribute('data-active-app', ids[index]);
      const positions = await carousel.locator('[data-showcase-card]').evaluate(card => ({ visualBottom: card.firstElementChild!.getBoundingClientRect().bottom, nameTop: card.querySelector('h3')!.getBoundingClientRect().top }));
      expect(positions.visualBottom).toBeLessThan(positions.nameTop);
      await expect(carousel.locator('[data-showcase-card] a[target="_blank"]').first()).toHaveAttribute('href', sources[index]);
      if (index < ids.length - 1) await next.click();
    }
    await next.click();
    await expect(carousel).toHaveAttribute('data-active-app', 'signal');
    await carousel.getByRole('button', { name: locale === 'ar' ? 'التطبيق السابق' : 'Previous app', exact: true }).click();
    await expect(carousel).toHaveAttribute('data-active-app', 'onlyoffice');
    await carousel.getByRole('button', { name: locale === 'ar' ? 'قارن الآن: ONLYOFFICE / Google Docs' : 'Compare now: ONLYOFFICE / Google Docs', exact: true }).click();
    await expect(page.locator('#comparison')).toBeFocused();
    await expect(page.locator('#comparison [data-app-name]')).toHaveText(['Google Docs', 'ONLYOFFICE']);
    await expect(page).toHaveURL(/app=onlyoffice.*#comparison/);
  });

  test(`touch swiping advances the carousel without turning vertical scrolling into an app change (${locale})`, async ({ page, context }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/alternatives/`);
    const carousel = page.locator('[data-app-showcase]');
    const description = carousel.locator('[data-showcase-card] p').nth(1);
    await description.scrollIntoViewIfNeeded();
    const box = (await description.boundingBox())!;
    const session = await context.newCDPSession(page);
    const swipe = async (x: number, y: number, dx: number, dy: number) => {
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx, y: y + dy }] });
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    const y = Math.min(720, Math.max(200, box.y + 25));
    await swipe(locale === 'ar' ? 100 : 280, y, locale === 'ar' ? 130 : -130, 0);
    await expect(carousel).toHaveAttribute('data-active-app', 'brave');
    await swipe(190, y, 2, -100);
    await expect(carousel).toHaveAttribute('data-active-app', 'brave');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await session.detach();
  });

  test(`the supplied alternatives film loops silently and pauses during scrolling (${locale})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { configurable: true, value: { effectiveType: '4g', saveData: false } }));
    await page.goto(`/${locale}/alternatives/`);
    const video = page.locator('[data-intro-variant="alternatives"] video');
    await expect(video).toHaveAttribute('src', '/videos/alternatives-hero-v1-720p.mp4');
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(.1);
    expect(await video.evaluate((v: HTMLVideoElement) => ({ duration: v.duration, muted: v.muted, loop: v.loop, inline: v.playsInline, controls: v.controls }))).toEqual({ duration: 8, muted: true, loop: true, inline: true, controls: false });
    await page.mouse.wheel(0, 45);
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
    await video.evaluate((v: HTMLVideoElement) => { v.currentTime = 7.85; });
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime < 1 && !v.paused)).toBe(true);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(video).toHaveAttribute('src', '/videos/alternatives-hero-v1-360p.mp4');
  });
}
