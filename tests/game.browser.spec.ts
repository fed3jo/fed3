import { test, expect, type Page } from '@playwright/test';
import { writeFileSync } from 'node:fs';

const dialog = (page: Page) => page.locator('[data-game-dialog]');
async function launch(page: Page, locale = 'ar') {
  await page.goto(`/${locale}/alternatives/#game`);
  await page.locator('[data-game-launch]').click();
  await expect(dialog(page)).toBeVisible();
}
async function openTask(page: Page) {
  await page.locator('[data-world] [data-active=true]').click();
  await expect(page.locator('[data-game-controls]')).toBeVisible();
}
async function assign(page: Page, file: string, role: string) {
  await page.locator(`[data-file="${file}"]`).click();
  await page.locator(`[data-role="${role}"]`).click();
}
async function advance(page: Page, stage: string) {
  await page.locator('[data-game-next]').click();
  await expect(dialog(page)).toHaveAttribute('data-stage', stage);
  if (stage !== 'ending') { await expect(page.locator('[data-game-controls]')).toHaveCount(0); await openTask(page); }
}
async function safeToCloud(page: Page) {
  await advance(page, 'consent');
  await page.getByRole('button', { name: 'راجع الشروط وحدد اختياراتك', exact: true }).click();
  await page.locator('[data-choice=reviewed]').click();
  await advance(page, 'photos');
  await page.locator('[data-photo-scope]').click();
  await page.locator('[data-photo="0"]').click();
  await page.locator('[data-choice=selected]').click();
  await advance(page, 'network');
  await page.locator('[data-choice=prepared]').click();
  await page.getByRole('button', { name: 'افحص عنوان الصفحة', exact: true }).click();
  await page.locator('[data-choice=verified]').click();
  await advance(page, 'cloud');
}
async function finishSafe(page: Page) {
  for (const [index, value] of ['market', 'exhibit', 'reviewers'].entries()) await assign(page, ['orders', 'portraits', 'stories'][index], value);
  await page.locator('[data-game-restore]').click();
  await advance(page, 'community');
  await page.locator('[data-choice=signal]').click();
  for (let i = 0; i < 3; i++) await page.locator(`[data-practice-step="${i}"]`).click();
  await advance(page, 'ending');
}

test('game code loads on demand; full prepared route has a causal ready ending', async ({ page }) => {
  const errors: string[] = []; const scripts: Promise<string>[] = []; const gameUrls = new Set<string>();
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (/\.(?:js|css)(?:\?|$)/.test(response.url())) scripts.push(response.text().then(source => {
      if (source.includes('fed3-opening-night-v1') || source.includes('data-calm')) gameUrls.add(response.url());
      return source;
    }).catch(() => ''));
  });
  await page.goto('/ar/alternatives/#game');
  await expect(page.locator('[data-game-launch]')).toBeVisible();
  const before = await Promise.all(scripts);
  expect(before.some(source => source.includes('fed3-opening-night-v1'))).toBe(false);
  expect(await dialog(page).count()).toBe(0);
  const initialBytes = await page.evaluate(() => performance.getEntriesByType('resource').reduce((sum, entry) => sum + (entry as PerformanceResourceTiming).encodedBodySize, 0));
  const mark = await page.evaluate(() => performance.now());
  await page.locator('[data-game-launch]').click();
  await expect(dialog(page)).toHaveAttribute('data-stage', 'intro');
  expect((await Promise.all(scripts)).some(source => source.includes('fed3-opening-night-v1'))).toBe(true);
  await expect(page.locator('[data-world] [data-character]')).toHaveCount(6);
  const reveal = page.getByRole('button', { name: 'اعرض الكلام كاملاً', exact: true });
  if (await reveal.isVisible()) await reveal.click();
  await page.screenshot({ animations: 'disabled', path: 'test-results/game-desktop-intro.png' });
  await safeToCloud(page);
  if (await reveal.isVisible()) await reveal.click();
  await page.screenshot({ animations: 'disabled', path: 'test-results/game-desktop-cloud.png' });
  await finishSafe(page);
  await expect(page.locator('[data-outcome=ready]')).toBeVisible();
  await expect(page.locator('[data-ready=true]')).toHaveCount(3);
  if (await reveal.isVisible()) await reveal.click();
  await expect(dialog(page).getByText('جهّزت نسخة واختبرت استرجاعها، راعيت نطاق المشاركة، ونقلت المهارة لشخص آخر.')).toBeVisible();
  await page.screenshot({ animations: 'disabled', path: 'test-results/game-desktop-ending.png' });
  await Promise.all(scripts);
  const resources = await page.evaluate(start => performance.getEntriesByType('resource').filter(entry => entry.startTime >= start).map(entry => ({ url: entry.name, name: entry.name.split('/').pop(), bytes: (entry as PerformanceResourceTiming).encodedBodySize })), mark);
  const additionalBytes = resources.reduce((sum, resource) => sum + resource.bytes, 0);
  const gameCodeAndStylesBytes = resources.filter(resource => gameUrls.has(resource.url)).reduce((sum, resource) => sum + resource.bytes, 0);
  expect(gameCodeAndStylesBytes).toBeGreaterThan(0);
  expect(gameCodeAndStylesBytes).toBeLessThan(100_000);
  expect(additionalBytes).toBeLessThan(350_000);
  writeFileSync('test-results/game-bundle.json', JSON.stringify({ initialResourceBytes: initialBytes, totalResourcesAfterOpenBytes: additionalBytes, gameCodeAndStylesBytes, resources, note: 'Encoded bodies observed in local production Chrome. Total after-open requests can include existing website link prefetch. Game code/styles exclude the cover and fonts. Device-dependent observation.' }, null, 2));
  expect(errors).toEqual([]);
});

test('unprepared route retains consequences and rewind clears only later decisions', async ({ page }) => {
  await launch(page);
  await advance(page, 'consent'); await page.locator('[data-choice=quick]').click();
  await advance(page, 'photos'); await page.locator('[data-choice=all]').click();
  await advance(page, 'network'); await page.locator('[data-choice=skipped]').click(); await page.locator('[data-choice=phished]').click();
  await advance(page, 'cloud');
  await expect(dialog(page)).toContainText('ظهر دخول غير معتاد');
  await expect(page.locator('[data-game-restore]')).toHaveCount(0);
  for (const file of ['orders', 'portraits', 'stories']) await assign(page, file, 'public');
  await advance(page, 'community'); await page.locator('[data-choice=existing]').click();
  await advance(page, 'ending');
  await expect(page.locator('[data-outcome=interrupted]')).toBeVisible();
  await expect(dialog(page)).toContainText('أدخلت البيانات في صفحة مقلّدة');
  await dialog(page).getByRole('button', { name: 'غيّر هذا القرار' }).nth(1).click();
  await expect(dialog(page)).toHaveAttribute('data-stage', 'photos');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('fed3-opening-night-v1')!).answers)).toMatchObject({ consent: 'quick', photos: null, backup: null, network: null, restored: false, community: null, trained: false });
});

test('modal locks background, pauses, restores focus and resumes exact saved decisions', async ({ page }) => {
  await launch(page);
  await safeToCloud(page);
  await assign(page, 'orders', 'market');
  await page.getByRole('button', { name: 'استراحة', exact: true }).click();
  await expect(dialog(page)).toHaveAttribute('data-paused', 'true');
  await expect(page.getByRole('heading', { name: 'خُذ وقتك. الليلة بتستناك.' })).toBeVisible();
  await page.getByRole('button', { name: 'كمّل اللعب', exact: true }).last().click();
  await expect(dialog(page)).toHaveAttribute('data-paused', 'false');
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => Boolean(document.querySelector('[data-game-dialog]')?.contains(document.activeElement)))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-game-controls]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(dialog(page)).toHaveCount(0);
  await expect(page.locator('[data-game-launch]')).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  await page.reload(); await page.locator('[data-game-launch]').click();
  await page.getByRole('button', { name: 'كمّل ليلتك', exact: true }).click();
  await expect(dialog(page)).toHaveAttribute('data-stage', 'cloud');
  await openTask(page);
  await page.locator('[data-file=orders]').click();
  await expect(page.locator('[data-role=market]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-game-restore]')).toBeVisible();
  await page.getByRole('button', { name: 'بدء اللعبة من جديد', exact: true }).click();
  await page.getByRole('button', { name: 'خلّيني أكمّل', exact: true }).click();
  await expect(dialog(page)).toHaveAttribute('data-stage', 'cloud');
  await page.getByRole('button', { name: 'بدء اللعبة من جديد', exact: true }).click();
  await page.getByRole('button', { name: 'امسح وابدأ', exact: true }).click();
  await expect(dialog(page)).toHaveAttribute('data-stage', 'intro');
});

test('Arabic and English mobile layouts support reduced motion without clipping', async ({ page }) => {
  test.setTimeout(75_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => localStorage.removeItem('fed3-opening-night-v1'));
  for (const locale of ['ar', 'en']) {
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      if (page.url() !== 'about:blank') await page.evaluate(() => localStorage.removeItem('fed3-opening-night-v1'));
      await launch(page, locale);
      const resume = page.getByRole('button', { name: locale === 'ar' ? 'كمّل ليلتك' : 'Continue your night', exact: true });
      if (await resume.isVisible()) await resume.click();
      await expect(dialog(page)).toHaveAttribute('data-calm', 'true');
      expect(await dialog(page).evaluate(node => node.scrollWidth <= innerWidth)).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.locator('[data-game-next]')).toBeEnabled();
      await expect(page.locator('[data-world]')).toBeVisible();
      if (width === 390) await page.screenshot({ animations: 'disabled', path: `test-results/game-${locale}-mobile.png` });
      await advance(page, 'consent');
      await page.locator('[data-choice=quick]').click();
      await advance(page, 'photos');
      const phone = page.locator('[data-device=phone]');
      expect(await phone.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
      await page.locator('[data-photo-scope]').click();
      await expect(page.locator('[data-choice=selected]')).toBeDisabled();
      await page.locator('[data-photo="0"]').click();
      await expect(page.locator('[data-choice=selected]')).toBeEnabled();
      if (width === 390) await page.screenshot({ animations: 'disabled', path: `test-results/game-${locale}-phone.png` });
      await page.locator('[data-choice=selected]').click();
      await advance(page, 'network');
      await page.locator('[data-choice=prepared]').click();
      await page.locator('[data-choice=mobile]').click();
      await advance(page, 'cloud');
      const desktop = page.locator('[data-device=desktop]');
      expect(await desktop.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
      await finishSafe(page);
      await expect(page.locator('[data-outcome=partial]')).toBeVisible();
      await page.keyboard.press('Escape');
      await page.keyboard.press('Escape');
    }
  }
});

test('character clicks open object tasks; room movement and popup focus remain usable', async ({ page }) => {
  await launch(page);
  await expect(page.locator('[data-game-controls]')).toHaveCount(0);
  const karim = page.locator('[data-person=karim]');
  const before = await karim.evaluate(node => getComputedStyle(node).transform);
  await page.locator('[data-game-next]').click();
  await expect(dialog(page)).toHaveAttribute('data-stage', 'consent');
  await expect.poll(() => karim.evaluate(node => getComputedStyle(node).transform)).not.toBe(before);
  await expect(page.locator('[data-game-controls]')).toHaveCount(0);
  await page.locator('[data-person=yaser]').click();
  await expect(page.locator('[data-device=person]')).toBeVisible();
  await expect(page.locator('[data-choice]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-person=yaser]')).toBeFocused();
  await karim.focus(); await page.keyboard.press('Enter');
  await expect(page.locator('[data-device=phone]')).toBeVisible();
  expect(await page.locator('[data-world]').evaluate(node => !!node.closest('[inert]'))).toBe(true);
  await page.locator('[data-choice=quick]').click();
  await page.keyboard.press('Escape');
  await expect(karim).toBeFocused();
  await karim.click();
  await expect(page.locator('[data-choice=quick]')).toHaveCount(0);
  await expect(page.locator('[data-game-next]')).toBeEnabled();
  await advance(page, 'photos');
  await page.locator('[data-photo-scope]').click();
  await expect(page.locator('[data-photo="1"]')).toBeDisabled();
  await page.locator('[data-photo="0"]').click();
  await page.locator('[data-choice=selected]').click();
  await expect(page.locator('[data-photo][data-shared=true]')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('fed3-opening-night-v1')!).answers.photos)).toBe('selected');
  await page.keyboard.press('Escape');
  await dialog(page).getByRole('button', { name: 'تقليل الحركة', exact: true }).click();
  await openTask(page);
  await expect(page.locator('[data-device=phone]')).toHaveCSS('opacity', '1');
});

test('blocked storage and blocked external network do not stop a complete playthrough', async ({ page }) => {
  const external: string[] = []; const posts: string[] = []; const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (request.method() === 'POST') posts.push(request.url()); });
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.hostname !== '127.0.0.1' && url.hostname !== 'localhost') { external.push(url.toString()); return route.abort(); }
    return route.continue();
  });
  await page.addInitScript(() => { Object.defineProperty(Storage.prototype, 'getItem', { value: () => { throw new DOMException('blocked'); } }); Object.defineProperty(Storage.prototype, 'setItem', { value: () => { throw new DOMException('blocked'); } }); });
  await launch(page); await safeToCloud(page); await finishSafe(page);
  await expect(page.locator('[data-outcome=ready]')).toBeVisible();
  await expect(dialog(page)).toContainText('يمكنك المتابعة بدون حفظ');
  expect(external).toEqual([]); expect(posts).toEqual([]); expect(errors).toEqual([]);
});

test('idle animation timing and repeated open/close remain bounded', async ({ page }) => {
  await launch(page);
  const timing = await page.evaluate(async () => {
    const samples: number[] = []; let last = performance.now();
    await new Promise<void>(resolve => {
      const tick = (time: number) => { samples.push(time - last); last = time; if (samples.length < 90) requestAnimationFrame(tick); else resolve(); };
      requestAnimationFrame(tick);
    });
    samples.shift(); samples.sort((a, b) => a - b);
    return { medianMs: samples[Math.floor(samples.length / 2)], p95Ms: samples[Math.floor(samples.length * .95)], samples: samples.length };
  });
  expect(timing.medianMs).toBeLessThan(55);
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('Escape'); await expect(dialog(page)).toHaveCount(0);
    await page.locator('[data-game-launch]').click(); await expect(dialog(page)).toBeVisible();
    await expect(page.locator('[data-world]')).toHaveCount(1);
  }
  await page.keyboard.press('Escape');
  expect(await page.evaluate(() => document.querySelectorAll('dialog').length)).toBe(0);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  writeFileSync('test-results/game-timing.json', JSON.stringify({ ...timing, note: '90 animation-frame samples from headless desktop Chrome. Full-screen SVG with no game loop. Device-dependent observation.' }, null, 2));
});
