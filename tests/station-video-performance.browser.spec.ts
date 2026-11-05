import { test, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

test('3G page paints before five seconds and autoplays the small video only in its station', async ({ page, context }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', { configurable: true, value: { effectiveType: '3g', downlink: 1.6, saveData: false } });
    const metrics: { lcp: number } = { lcp: 0 };
    Object.assign(window, { fed3Performance: metrics });
    new PerformanceObserver(list => { metrics.lcp = list.getEntries().at(-1)!.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  const session = await context.newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.setCacheDisabled', { cacheDisabled: true });
  await session.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8, connectionType: 'cellular3g' });
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const mediaRequests: string[] = [];
  page.on('request', request => { if (/\.mp4(?:\?|$)|Fed3_Frame_240/.test(request.url())) mediaRequests.push(request.url()); });
  await page.goto('/ar/', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'تفعيل الجبل ثلاثي الأبعاد' })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(mediaRequests).toEqual([]);
  const paint = await page.evaluate(() => ({
    fcpMs: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
    lcpMs: (window as Window & { fed3Performance?: { lcp: number } }).fed3Performance?.lcp,
    transferBytes: performance.getEntriesByType('resource').reduce((sum, entry) => sum + (entry as PerformanceResourceTiming).transferSize, 0),
  }));
  expect(paint.fcpMs).toBeGreaterThan(0);
  expect(paint.fcpMs).toBeLessThan(5000);
  expect(paint.lcpMs).toBeGreaterThan(0);
  expect(paint.lcpMs).toBeLessThan(5000);
  const stationPlaybackStartMs: Record<string, number> = {};
  let previous: string | null = null;
  for (const id of ['alternatives', 'home-cloud', 'communities']) {
    const started = Date.now();
    await page.locator(`#${id}`).evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    const video = page.locator(`#${id} video`);
    await expect(video).toHaveAttribute('src', `/videos/${id}-v1-360p.mp4`);
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime), { timeout: 5000 }).toBeGreaterThan(0);
    stationPlaybackStartMs[id] = Date.now() - started;
    expect(await video.evaluate((element: HTMLVideoElement) => element.muted && element.loop && element.playsInline)).toBe(true);
    if (previous) await expect.poll(() => page.locator(`#${previous} video`).evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
    previous = id;
  }
  await page.locator('#alternatives').evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await expect.poll(() => page.locator('#alternatives video').evaluate((element: HTMLVideoElement) => element.paused)).toBe(false);
  await expect.poll(() => page.locator('#communities video').evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  const report = { conditions: 'Cold cache, local production server, 1.6 Mbps down / 750 Kbps up, 150 ms latency, 4x CPU slowdown, 390x844', ...paint, stationPlaybackStartMs, mediaRequests };
  await writeFile('test-results/station-video-3g.json', JSON.stringify(report, null, 2));
});

test('video supports byte ranges, long-lived caching and desktop playback', async ({ page, request }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { configurable: true, value: { effectiveType: '4g', downlink: 10, saveData: false } }));
  const response = await request.get('/videos/alternatives-v1-360p.mp4', { headers: { Range: 'bytes=0-1023' } });
  expect(response.status()).toBe(206);
  expect(response.headers()['content-type']).toContain('video/mp4');
  expect(response.headers()['cache-control']).toContain('immutable');
  expect((await response.body()).length).toBe(1024);
  await page.goto('/en/');
  await page.locator('#alternatives').scrollIntoViewIfNeeded();
  const video = page.locator('#alternatives video');
  await expect(video).toHaveAttribute('src', '/videos/alternatives-v1-720p.mp4');
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0);
  expect(await video.evaluate((element: HTMLVideoElement) => element.muted && element.loop && element.playsInline)).toBe(true);
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.readyState)).toBeGreaterThanOrEqual(2);
  await video.evaluate((element: HTMLVideoElement) => { element.currentTime = element.duration - .2; });
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime < 1 && !element.paused)).toBe(true);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: false }); document.dispatchEvent(new Event('visibilitychange')); });
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(false);
  await page.locator('#alternatives').getByRole('button', { name: 'Pause video', exact: true }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
});

test('cloud and community desktop renditions play and support byte ranges', async ({ page, request }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'connection', { configurable: true, value: { effectiveType: '4g', downlink: 10, saveData: false } }));
  await page.goto('/en/');
  for (const id of ['home-cloud', 'communities']) {
    const response = await request.get(`/videos/${id}-v1-720p.mp4`, { headers: { Range: 'bytes=0-1023' } });
    expect(response.status()).toBe(206);
    expect(response.headers()['cache-control']).toContain('immutable');
    expect((await response.body()).length).toBe(1024);
    await page.locator(`#${id}`).evaluate(element => element.scrollIntoView({ block: 'start', behavior: 'instant' }));
    const video = page.locator(`#${id} video`);
    await expect(video).toHaveAttribute('src', `/videos/${id}-v1-720p.mp4`);
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0);
    await page.locator('#identity-heading').evaluate(element => element.scrollIntoView({ behavior: 'instant' }));
    await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  }
});
