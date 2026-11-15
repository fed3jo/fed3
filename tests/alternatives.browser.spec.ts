import { test, expect } from '@playwright/test';

test('the streamlined app showcase and all five comparisons keep matching guides and sources', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/ar/alternatives/');
  await expect(page.locator('[data-showcase-card]')).toHaveCount(1);
  await expect(page.locator('[data-app-showcase] button[aria-pressed]')).toHaveCount(5);
  await expect(page.locator('[data-comparison-group]')).toHaveCount(4);
  await expect(page.locator('[data-comparison-row]')).toHaveCount(10);
  await expect(page.locator('#catalog').getByRole('searchbox')).toHaveCount(0);
  await page.getByRole('button', { name: 'عرض Nextcloud', exact: true }).click();
  await expect(page.locator('[data-showcase-card] h3')).toHaveText(['Nextcloud']);
  await page.getByRole('button', { name: 'قارن الآن: Nextcloud / Google Drive' }).click();
  await expect(page.locator('#comparison [data-app-name]')).toHaveText(['Google Drive', 'Nextcloud']);
  await expect(page).toHaveURL(/app=nextcloud/);
  await expect(page.locator('#comparison')).toBeFocused();
  for (const [id, current, alternative, official] of [
    ['signal', 'WhatsApp', 'Signal', 'https://signal.org/download/'],
    ['brave', 'Google Chrome', 'Brave', 'https://brave.com/download/'],
    ['proton-mail', 'Gmail', 'Proton Mail', 'https://proton.me/mail'],
    ['nextcloud', 'Google Drive', 'Nextcloud', 'https://nextcloud.com/install/'],
    ['onlyoffice', 'Google Docs', 'ONLYOFFICE', 'https://www.onlyoffice.com/download-desktop'],
  ]) {
    await page.locator('[data-comparison-picker]>button').click();
    await page.locator(`[data-comparison-option="${id}"]`).click();
    await expect(page.locator('#comparison [data-app-name]')).toHaveText([current, alternative]);
    await expect(page.locator('[data-comparison-row]')).toHaveCount(10);
    await expect(page.locator('[data-comparison-row]')).toHaveCount(10);
    await expect(page.locator('#comparison a[data-download]').first()).toHaveAttribute('href', id === 'proton-mail' ? 'https://proton.me/mail/download' : official);
    await expect(page.locator('#comparison').getByRole('link', { name: `صفحة التطبيق: ${alternative}`, exact: true })).toHaveAttribute('href', `/ar/apps/${id}/`);
    expect(await page.locator('[data-comparison-row]').evaluateAll(rows => rows.every(row => row.querySelectorAll('a[href^="https://"]').length > 0))).toBe(true);
  }
  await expect(page.locator('#game')).toContainText('بكرا الافتتاح');
  await expect(page.locator('#game [data-game-launch]')).toBeVisible();
  await expect(page.locator('[data-game-dialog]')).toHaveCount(0);
  const featureTab = page.locator('[data-comparison-group="features"]');
  await featureTab.click();
  await expect(featureTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-comparison-group="privacy"]')).toHaveAttribute('aria-selected', 'false');
  await expect(page.locator('[data-comparison-row]:visible')).toHaveCount(1);
  await page.locator('[data-comparison-topic=platforms]').click();
  await expect(page.locator('[data-comparison-row=platforms]')).toBeVisible();
  await page.locator('[data-comparison-row=platforms] details summary').click();
  await expect(page.locator('[data-comparison-row=platforms] details[open] a').first()).toBeVisible();
  expect(await page.locator('img[src^="/app-logos/"]').evaluateAll(images => images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
  expect(errors).toEqual([]);
});

test('shared comparison and locale survive navigation and reload', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/ar/alternatives/?app=proton-mail&group=migration#comparison');
  await expect(page.locator('#comparison [data-app-name]')).toHaveText(['Gmail', 'Proton Mail']);
  await expect(page.locator('[data-comparison-group=migration]')).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('link', { name: 'Switch to English' }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('#comparison [data-app-name]')).toHaveText(['Gmail', 'Proton Mail']);
  await expect(page.locator('[data-comparison-row]:visible')).toHaveCount(1);
  await page.getByRole('button', { name: 'Copy comparison link', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Link copied' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('app=proton-mail&group=migration');
  await page.reload();
  await expect(page.locator('[data-comparison-group=migration]')).toHaveAttribute('aria-selected', 'true');
  await page.locator('[data-comparison-group=cost]').click();
  await expect(page.locator('[data-comparison-row]:visible')).toHaveCount(1);
  await expect(page).toHaveURL(/group=cost/);
  await page.goto('/en/alternatives/?app=unknown&group=unknown');
  await expect(page.locator('#comparison [data-app-name]')).toHaveText(['WhatsApp', 'Signal']);
  await expect(page.locator('[data-comparison-group=privacy]')).toHaveAttribute('aria-selected', 'true');
});

test('mobile layouts, both writing directions and reduced motion remain usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['ar', 'en']) {
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/${locale}/alternatives/`);
      await expect(page.locator('[data-motion]')).toHaveAttribute('data-motion', 'reduced');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.locator('[data-comparison-picker]>button').click();
      await page.locator('[data-comparison-option=nextcloud]').click();
      await expect(page.locator('#comparison [data-app-name]')).toHaveText(['Google Drive', 'Nextcloud']);
      expect(await page.locator('[data-comparison-row]:visible').evaluateAll(cards => cards.every(card => card.getBoundingClientRect().right <= innerWidth))).toBe(true);
      if (width === 390) await page.screenshot({ path: `test-results/alternatives-${locale}-mobile.png`, fullPage: true });
    }
  }
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.goto('/ar/alternatives/');
  await page.screenshot({ path: 'test-results/alternatives-ar-desktop.png', fullPage: true });
  await page.screenshot({ path: 'test-results/alternatives-preview.png', fullPage: false });
  await page.getByRole('button', { name: 'عرض Nextcloud', exact: true }).click();
  await page.getByRole('button', { name: 'قارن الآن: Nextcloud / Google Drive', exact: true }).click();
  await expect(page.locator('#comparison')).toBeInViewport();
  await page.screenshot({ path: 'test-results/alternatives-comparison-preview.png', fullPage: false });
});

test('local floating navigation, single appearance and Lenis lifecycle work together', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => localStorage.setItem('fed3-theme', 'dark'));
  await page.goto('/ar/alternatives/');
  expect(await page.locator('header').evaluate(header => getComputedStyle(header).position)).toBe('fixed');
  expect(await page.locator('[data-motion]').evaluate(root => getComputedStyle(root).backgroundColor)).toBe('rgb(242, 239, 233)');
  await expect(page.locator('[data-theme]')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => Boolean(window.fed3Lenis))).toBe(true);
  await page.getByRole('button', { name: 'تقليل الحركة', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(window.fed3Lenis))).toBe(false);
  await page.getByRole('button', { name: 'تقليل الحركة', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Boolean(window.fed3Lenis))).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole('button', { name: 'التنقّل', exact: true });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#alternatives-navigation')).toBeVisible();
  const stations = page.locator('#alternatives-navigation').getByRole('group', { name: 'محطات المبادرة' });
  expect(await stations.locator('a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))).toEqual(['/ar/alternatives/', '/ar/home-cloud/', '/ar/communities/']);
  await expect(stations.locator('[aria-current="page"]')).toHaveAttribute('href', '/ar/alternatives/');
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(page.locator('#alternatives-navigation')).toBeHidden();
  await menu.click();
  await page.locator('#alternatives-navigation').getByRole('link', { name: 'المقارنة', exact: true }).click();
  await expect(page.locator('#comparison')).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#alternatives-navigation a[href="#comparison"]')).toHaveAttribute('aria-current', 'location');
  await page.evaluate(() => {
    const previous = window.fed3Lenis!;
    const destroy = previous.destroy.bind(previous);
    previous.destroy = () => { (window as unknown as { previousLenisDestroyed: boolean }).previousLenisDestroyed = true; destroy(); };
  });
  await menu.click();
  await stations.locator('a[href="/ar/home-cloud/"]').click();
  await expect(page).toHaveURL(/ar\/home-cloud/);
  await expect.poll(() => page.evaluate(() => (window as unknown as { previousLenisDestroyed: boolean }).previousLenisDestroyed)).toBe(true);
  await expect.poll(() => page.evaluate(() => Boolean(window.fed3Lenis))).toBe(true);
});

test('local sections, directional arrows and journey links work in Arabic and English', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['ar', 'en']) {
    await page.goto(`/${locale}/alternatives/?app=nextcloud#comparison`);
    const nav = page.locator('#alternatives-navigation');
    expect(await nav.locator('a:visible').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))).toEqual(['#catalog', '#comparison', '#game']);
    await expect(page.locator('#comparison [data-app-name]')).toHaveText(['Google Drive', 'Nextcloud']);
    await expect(nav.locator('a[href="#comparison"]')).toHaveAttribute('aria-current', 'location');
    const arrows = page.locator('[data-directional-arrow]:visible');
    expect(await arrows.evaluateAll(nodes => nodes.every(node => getComputedStyle(node).transform === (document.documentElement.dir === 'rtl' ? 'matrix(-1, 0, 0, 1, 0, 0)' : 'none')))).toBe(true);
    const positions = await page.locator('#comparison [data-app-name]').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().x));
    expect(locale === 'ar' ? positions[0] > positions[1] : positions[0] < positions[1]).toBe(true);
    const pairs = await page.locator('[data-comparison-pair] img').evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().x));
    expect(locale === 'ar' ? pairs[0] > pairs[1] : pairs[0] < pairs[1]).toBe(true);
    const home = page.getByRole('link', { name: locale === 'ar' ? 'العودة إلى الرئيسية' : 'Back to home', exact: true });
    await expect(home).toHaveAttribute('href', `/${locale}/`);
    await expect(page.locator('[data-station="home-cloud"]')).toHaveAttribute('href', `/${locale}/home-cloud/`);
    await expect(page.locator('[data-station="communities"]')).toHaveAttribute('href', `/${locale}/communities/`);
    await nav.locator('a[href="#game"]').click();
    await expect(page.locator('#game')).toBeFocused();
    await expect(page).toHaveURL(/#game$/);
    await nav.locator('a[href="#catalog"]').click();
    await expect(page.locator('#catalog')).toBeFocused();
  }
});

test('all five app pages offer official downloads and return to the matching comparison', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 844 });
  const apps = [
    ['signal', 'Signal', 'https://signal.org/download/'],
    ['brave', 'Brave', 'https://brave.com/download/'],
    ['proton-mail', 'Proton Mail', 'https://proton.me/mail/download'],
    ['nextcloud', 'Nextcloud', 'https://nextcloud.com/install/'],
    ['onlyoffice', 'ONLYOFFICE', 'https://www.onlyoffice.com/download-desktop'],
  ];
  for (const locale of ['ar', 'en']) {
    for (const [id, name, download] of apps) {
      const response = await page.goto(`/${locale}/apps/${id}/`);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
      await expect(page.locator('[data-download]')).toHaveAttribute('href', download);
      const comparison = page.getByRole('link', { name: locale === 'ar' ? 'افتح المقارنة الكاملة' : 'Open full comparison', exact: true });
      await expect(comparison).toHaveAttribute('href', `/${locale}/alternatives/?app=${id}#comparison`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  await page.getByRole('link', { name: 'Open full comparison', exact: true }).click();
  await expect(page.locator('#comparison [data-app-name]')).toHaveText(['Google Docs', 'ONLYOFFICE']);
  await page.locator('#comparison').getByRole('link', { name: 'App details: ONLYOFFICE', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('ONLYOFFICE');
  await page.getByRole('link', { name: 'التبديل إلى العربية', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page).toHaveURL(/ar\/apps\/onlyoffice/);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/app-details-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
