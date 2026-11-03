import { test, expect, type Page } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const manifest = JSON.parse(readFileSync('public/Fed3_Frame_240/sequence.json', 'utf8'));
const validFrame = readFileSync('public/Fed3_Frame_240/frame_00001.png');
const bad = new Set<number>(manifest.frames.filter((f: { file: string; sha256: string }) => createHash('sha256').update(readFileSync(`public/Fed3_Frame_240/${f.file}`)).digest('hex') !== f.sha256).map((f: { index: number }) => f.index));

test.beforeEach(async ({ page }) => {
  // Exercise the requested locale rather than automatic navigator-language detection.
  await page.addInitScript(() => localStorage.setItem('fed3-locale', 'ar'));
});

// Isolated browser fixture, NEVER used by the application or shipped as replacement assets.
// Only damaged files are substituted to exercise the all-downloads-complete timeline path.
async function completeSequenceFixture(page: Page) {
  const copy = structuredClone(manifest);
  for (const f of copy.frames) if (bad.has(f.index)) { f.bytes = validFrame.length; f.sha256 = createHash('sha256').update(validFrame).digest('hex'); }
  await page.route('**/Fed3_Frame_240/sequence.json', route => route.fulfill({ json: copy }));
  await page.route('**/Fed3_Frame_240/frame_*.png', route => {
    const n = Number(route.request().url().match(/frame_(\d+)/)![1]);
    return bad.has(n) ? route.fulfill({ body: validFrame, contentType: 'image/png' }) : route.continue();
  });
}
async function triggers(page: Page) { return page.evaluate(() => window.ScrollTrigger?.getAll().length || 0); }
async function jump(page: Page, progress: number) {
  await expect(page.locator('aside')).toHaveCount(0);
  await page.evaluate(p => { const t = window.ScrollTrigger!.getById('fed3-sequence')!; const top = t.start + (t.end - t.start) * p; if (window.fed3Lenis) window.fed3Lenis.scrollTo(top, { immediate: true }); else window.scrollTo({ top, behavior: 'instant' }); }, progress);
}

test('injected download failures retain the available frames and keyboard access to the simplified journey', async ({ page }) => {
  const failures = new Set([13, 14, 15, 16, 33, 52, 67, 68, 69, 90, 91, 104, 105, 134, 157, 175, 176, 206, 207, 227, 228]);
  await page.route('**/Fed3_Frame_240/frame_*.png', route => {
    const index = Number(route.request().url().match(/frame_(\d+)/)![1]);
    return failures.has(index) ? route.fulfill({ status: 503, body: 'Injected test failure' }) : route.continue();
  });
  const errors: string[] = [], requests: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => { if (msg.type() === 'error' && /hydrat|did not match/i.test(msg.text())) errors.push(msg.text()); });
  page.on('request', req => { if (/frame_\d+\.png/.test(req.url())) requests.push(req.url()); });
  await page.goto('/ar/');
  await expect.poll(() => triggers(page)).toBe(1);
  await expect(page.locator('aside')).toHaveCount(0);
  await expect(page.locator('canvas[data-frame]')).toHaveAttribute('data-frame', '1');
  expect(new Set(requests).size).toBe(240);
  expect(requests.filter(url => url.endsWith('frame_00001.png'))).toHaveLength(1);
  await page.screenshot({ path: 'test-results/real-assets-error-ar.png' });
  await page.getByRole('link', { name: 'انتقل إلى المحتوى', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-mode]')).toHaveAttribute('data-mode', 'simple');
  await expect(page.locator('main h1')).toHaveText('افهم خياراتك الرقمية');
  await expect(page.locator('[data-station] h2')).toHaveCount(4);
  await expect(page.locator('canvas[data-frame]')).toHaveCount(0);
  await expect(page.locator('[data-station] img:not(noscript img)')).toHaveCount(4);
  await page.screenshot({ path: 'test-results/desktop-ar.png' });
  await page.evaluate(() => window.scrollTo(0, innerHeight));
  await page.getByRole('link', { name: 'Switch to English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await expect(page.locator('h1')).toHaveText('Understand your digital choices');
  await page.screenshot({ path: 'test-results/desktop-en.png' });
  await page.evaluate(() => window.scrollTo(0, innerHeight));
  await page.getByRole('link', { name: 'التبديل إلى العربية' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('[data-station] img:not(noscript img)')).toHaveCount(4);
  await page.evaluate(() => window.scrollTo(0, innerHeight));
  await expect(page.getByRole('link', { name: 'Switch to English' })).toBeInViewport();
  await page.screenshot({ path: 'test-results/desktop-ar.png', animations: 'disabled' });
  expect(errors).toEqual([]);
});

test('reduced motion, mobile and short viewport load only five anchors and preserve all copy', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const frames: string[] = [];
  page.on('request', req => { if (/frame_\d+\.png/.test(req.url())) frames.push(req.url()); });
  await page.goto('/ar/');
  await expect(page.locator('[data-mode]')).toHaveAttribute('data-mode', 'simple');
  await expect(page.locator('[data-station] img:not(noscript img)')).toHaveCount(4);
  expect(frames.length).toBe(5);
  expect(await page.locator('canvas[data-frame]').count()).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/mobile-ar.png', fullPage: true });
  await page.evaluate(() => window.scrollTo(0, innerHeight));
  await page.getByRole('button', { name: 'التنقّل', exact: true }).click();
  await page.locator('#main-navigation').getByRole('link', { name: 'المجتمعات الرقمية', exact: true }).click();
  await expect(page.locator('#communities h2')).toBeInViewport();
  await page.getByRole('link', { name: 'Switch to English' }).click();
  await expect(page.locator('#communities h2')).toBeInViewport();
  await page.screenshot({ path: 'test-results/mobile-en.png', fullPage: true });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1280, height: 600 });
  await page.reload();
  await expect(page.locator('[data-mode]')).toHaveAttribute('data-mode', 'animated');
  await expect.poll(() => triggers(page)).toBe(1);
  await page.getByRole('link', { name: 'Skip to content', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-mode]')).toHaveAttribute('data-mode', 'simple');
  await expect(page.locator('[data-station] h2')).toHaveCount(4);
});

test('GSAP failure and JavaScript disabled expose server-rendered content', async ({ page, browser }) => {
  await page.route('**/vendor/gsap.min.js', route => route.abort());
  await page.goto('/en/');
  await expect(page.locator('[data-mode]')).toHaveAttribute('data-mode', 'simple');
  await expect(page.getByRole('status').filter({ hasText: 'All content is available below' })).toBeVisible();
  await expect(page.locator('[data-station] h2')).toHaveCount(4);
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const staticPage = await context.newPage();
  await staticPage.goto(`${process.env.TEST_BASE_URL || 'http://127.0.0.1:3000'}/ar/`);
  await expect(staticPage.locator('h1')).toHaveText('افهم خياراتك الرقمية');
  await expect(staticPage.locator('[data-station] h2')).toHaveCount(4);
  await expect(staticPage.locator('noscript img')).toHaveCount(4);
  await context.close();
});

test('fixture: all holds, reverse and rapid scroll, locale progress, route cleanup and exact endpoints', async ({ page }) => {
  test.setTimeout(90_000);
  await completeSequenceFixture(page);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  const requests: string[] = []; page.on('request', r => { if (/frame_\d+\.png/.test(r.url())) requests.push(r.url()); });
  await page.goto('/en/');
  await expect.poll(() => triggers(page), { timeout: 45_000 }).toBe(1);
  await expect(page.locator('canvas[data-frame]')).toHaveAttribute('data-frame', '1');
  await expect(page.locator('aside')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start your journey', exact: true }).click();
  await expect(page.locator('canvas[data-frame]')).toHaveAttribute('data-frame', '60');
  await expect(page.getByRole('heading', { name: 'Change your tools. Expand your options.' })).toBeVisible();
  await expect(page.locator('[data-station]:not([hidden])')).toHaveCount(1);
  await page.screenshot({ path: 'test-results/fixture-alternatives-en.png' });
  await page.locator('#main-navigation').getByRole('link', { name: 'Local Cloud (Home-Cloud)', exact: true }).click();
  await expect(page.locator('canvas[data-frame]')).toHaveAttribute('data-frame', '120');
  await expect(page.getByText('Each institution operates its own independent device.')).toBeVisible();
  await page.screenshot({ path: 'test-results/fixture-home-en.png' });
  await page.getByRole('link', { name: 'التبديل إلى العربية' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('canvas[data-frame]')).toHaveAttribute('data-frame', '120');
  await expect(page.locator('aside')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'سحابتكم، على جهازكم.' })).toBeVisible();
  expect(await triggers(page)).toBe(1);
  await page.screenshot({ path: 'test-results/fixture-home-ar.png' });
  await jump(page, .79);
  await expect(page.locator('canvas[data-frame]')).toHaveAttribute('data-frame', '180');
  await jump(page, 1);
  await expect(page.locator('canvas[data-frame]')).toHaveAttribute('data-frame', '240');
  await expect(page.getByRole('heading', { name: 'ابدأ بخطوة. وخلي القرار بإيدك.' })).toBeVisible();
  await jump(page, .27);
  await expect(page.locator('canvas[data-frame]')).toHaveAttribute('data-frame', '60');
  await jump(page, 0);
  await expect(page.locator('canvas[data-frame]')).toHaveAttribute('data-frame', '1');
  for (const p of [.9, .4, .8, .1, .53]) await jump(page, p);
  await expect(page.locator('canvas[data-frame]')).toHaveAttribute('data-frame', '120');
  await page.getByRole('link', { name: 'تعرّف على Home-Cloud', exact: true }).click();
  await expect(page).toHaveURL(/\/ar\/home-cloud\//);
  expect(await triggers(page)).toBe(0);
  await page.locator('footer').getByRole('link', { name: 'العودة إلى الرئيسية', exact: true }).click();
  await expect.poll(() => triggers(page)).toBe(1);
  await expect(page.locator('canvas[data-frame]')).toHaveAttribute('data-frame', '120');
  // The dynamic root can force a full-document navigation. HTTP cache still serves assets.
  expect(new Set(requests).size).toBe(240);
  expect(errors).toEqual([]);
});

test('fixture: cache budgets and browser timing during continuous forward/reverse scrolling', async ({ page }) => {
  await completeSequenceFixture(page);
  await page.addInitScript(() => {
    const stats = { liveBitmaps: 0, peakBitmaps: 0, bytes: 0, peakBytes: 0, longTasks: [] as number[], rafGaps: [] as number[] };
    (window as unknown as { fed3TestStats: typeof stats }).fed3TestStats = stats;
    const original = window.createImageBitmap.bind(window);
    window.createImageBitmap = (async (...args: Parameters<typeof createImageBitmap>) => {
      const image = await original(...args);
      const bytes = image.width * image.height * 4;
      stats.liveBitmaps++; stats.bytes += bytes;
      stats.peakBitmaps = Math.max(stats.peakBitmaps, stats.liveBitmaps); stats.peakBytes = Math.max(stats.peakBytes, stats.bytes);
      const close = image.close.bind(image); let closed = false;
      image.close = () => { if (!closed) { stats.liveBitmaps--; stats.bytes -= bytes; closed = true; } close(); };
      return image;
    }) as typeof createImageBitmap;
    new PerformanceObserver(list => stats.longTasks.push(...list.getEntries().map(e => e.duration))).observe({ type: 'longtask', buffered: true });
  });
  await page.goto('/en/');
  await expect.poll(() => triggers(page)).toBe(1);
  const timing = await page.evaluate(async () => {
    const stats = (window as unknown as { fed3TestStats: { liveBitmaps: number; peakBitmaps: number; peakBytes: number; longTasks: number[]; rafGaps: number[] } }).fed3TestStats;
    stats.longTasks = [];
    const trigger = window.ScrollTrigger!.getById('fed3-sequence')!;
    const start = performance.now(); let last = start;
    await new Promise<void>(resolve => {
      const tick = (time: number) => {
        stats.rafGaps.push(time - last); last = time;
        const phase = Math.min(1, (time - start) / 5000);
        const top = trigger.start + (trigger.end - trigger.start) * (phase < .5 ? phase * 2 : (1 - phase) * 2);
        if (window.fed3Lenis) window.fed3Lenis.scrollTo(top, { immediate: true }); else window.scrollTo({ top, behavior: 'instant' });
        if (phase < 1) requestAnimationFrame(tick); else resolve();
      };
      requestAnimationFrame(tick);
    });
    return stats;
  });
  expect(timing.peakBitmaps).toBeLessThanOrEqual(16);
  expect(timing.peakBytes).toBeLessThanOrEqual(80 * 1024 * 1024);
  const sorted = timing.rafGaps.filter(n => n > 0).sort((a, b) => a - b);
  writeFileSync('test-results/performance.json', JSON.stringify({ ...timing, rafGaps: undefined, rafSamples: sorted.length, medianIntervalMs: sorted[Math.floor(sorted.length / 2)], p95IntervalMs: sorted[Math.floor(sorted.length * .95)], intervalsOver34Ms: sorted.filter(n => n > 34).length, notes: 'Headless Chrome on this Windows machine, development build, test-only substitutions for the 21 damaged PNGs. Not a device-wide FPS guarantee.' }, null, 2));
  await page.locator('footer').getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL(/\/en\/about\//);
  await expect.poll(() => triggers(page)).toBe(0);
  await expect.poll(() => page.evaluate(() => (window as unknown as { fed3TestStats: { liveBitmaps: number } }).fed3TestStats?.liveBitmaps || 0)).toBe(0);
});

test('fixture: animated mobile keeps full visual above the longest Arabic copy', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await completeSequenceFixture(page);
  await page.goto('/ar/');
  await expect.poll(() => triggers(page)).toBe(1);
  await jump(page, .53);
  await expect(page.locator('canvas[data-frame]')).toHaveAttribute('data-frame', '120');
  await expect(page.getByRole('link', { name: 'تعرّف على Home-Cloud', exact: true })).toBeInViewport();
  const boxes = await page.locator('canvas[data-frame], [data-station="home-cloud"]').evaluateAll(elements => elements.map(el => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; }));
  expect(boxes[0].bottom).toBeLessThanOrEqual(boxes[1].top + 2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/fixture-mobile-home-ar.png' });
});

test('configured destinations resolve and locale preference returns through the root', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/');
  for (const route of ['alternatives', 'home-cloud', 'communities', 'about', 'privacy', 'contact']) {
    const response = await page.request.get(`/en/${route}/`);
    expect(response.status()).toBe(200);
  }
  await page.evaluate(() => window.scrollTo(0, innerHeight));
  await page.getByRole('link', { name: 'التبديل إلى العربية' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await page.goto('/'); await expect(page).toHaveURL(/\/ar\//);
  await page.evaluate(() => window.scrollTo(0, innerHeight));
  await page.getByRole('link', { name: 'Switch to English' }).click();
  await page.goto('/'); await expect(page).toHaveURL(/\/en\//);
});

test('fixture: HTML image decode fallback works and keyboard focus reaches only the active station', async ({ page }) => {
  await completeSequenceFixture(page);
  await page.addInitScript(() => { Object.defineProperty(window, 'createImageBitmap', { value: undefined }); });
  await page.goto('/en/');
  await expect.poll(() => triggers(page)).toBe(1);
  await jump(page, .53);
  await expect(page.locator('canvas[data-frame]')).toHaveAttribute('data-frame', '120');
  const actions = page.locator('[data-station] a:visible');
  await expect(actions).toHaveCount(1);
  await expect(actions).toHaveText('Discover Home Cloud');
  await actions.focus();
  await jump(page, .79);
  await expect(page.locator('canvas[data-frame]')).toHaveAttribute('data-frame', '180');
  expect(await page.evaluate(() => document.activeElement?.closest('[hidden]') === null)).toBe(true);
  await expect(page.locator('[data-station] a:visible')).toHaveText('Explore communities');
});

test('cached reload reuses anchor response bodies', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/');
  await expect(page.locator('[data-station] img:not(noscript img)')).toHaveCount(4);
  await page.reload();
  await expect(page.locator('[data-station] img:not(noscript img)')).toHaveCount(4);
  const transfers = await page.evaluate(() => performance.getEntriesByType('resource').filter(e => /frame_\d+\.png/.test(e.name)).map(e => {
    const r = e as PerformanceResourceTiming; return { name: r.name, transfer: r.transferSize, encoded: r.encodedBodySize };
  }));
  expect(transfers).toHaveLength(5);
  expect(transfers.every(t => t.encoded > 0 && t.transfer < t.encoded)).toBe(true);
  writeFileSync('test-results/cached-reload.json', JSON.stringify(transfers, null, 2));
});



