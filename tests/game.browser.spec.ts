import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { SAVE_KEY, type SavedRun } from '../lib/fed3/exposed';

const game = (page: Page) => page.locator('[data-exposed-game]');
const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';
const checkpoint: SavedRun = { version: 1, stage: 2, choices: { navigation: true, contacts: false, cloud: false }, seconds: 37, pulses: 2 };

test.setTimeout(90_000);

async function launch(page: Page, locale = 'ar') {
  await page.goto(`${baseURL}/${locale}/alternatives/#game`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('[data-game-launch]')).toBeVisible({ timeout: 30_000 });
  await page.locator('[data-game-launch]').click();
  await expect(game(page)).toBeVisible();
  await expect(game(page)).toHaveAttribute('data-mode', 'intro', { timeout: 30_000 });
  await expect(page.locator('[data-start]')).toBeEnabled({ timeout: 40_000 });
}
async function start(page: Page) {
  await page.locator('[data-start]').click();
  await expect(page.locator('[data-briefing]')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('[data-briefing] h2, [data-briefing] kbd')).toHaveCount(0);
  await expect(page.locator('[data-briefing] strong')).toHaveCount(3);
  await expect(page.locator('[data-briefing] mark')).toHaveCount(3);
  await page.locator('[data-briefing-start]').click();
  await expect(game(page)).toHaveAttribute('data-mode', 'playing');
}
async function position(page: Page) {
  return { x: Number(await game(page).getAttribute('data-x')), z: Number(await game(page).getAttribute('data-z')) };
}
async function seed(page: Page, run: SavedRun) {
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: SAVE_KEY, value: run });
}
async function close(page: Page) {
  await page.locator('[data-game-close]').click();
  await expect(game(page)).toHaveCount(0);
  await expect(page.locator('[data-game-launch]')).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  await expect(page.locator('[data-world] canvas')).toHaveCount(0);
}
function pageErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  return errors;
}
async function assertCanvasFits(page: Page) {
  const canvas = page.locator('[data-world] canvas');
  await expect(canvas).toBeVisible();
  await expect.poll(async () => {
    const box = await canvas.boundingBox();
    const viewport = page.viewportSize()!;
    return !!box && Math.abs(box.width - viewport.width) < 2 && Math.abs(box.height - viewport.height) < 2;
  }).toBe(true);
  expect(await game(page).evaluate(node => node.scrollWidth <= innerWidth)).toBe(true);
}

test('3D game loads on demand, moves with keyboard, pulses and pauses', async ({ page }) => {
  const errors = pageErrors(page);
  await page.goto(`${baseURL}/ar/alternatives/#game`);
  await expect(page.locator('[data-game-launch]')).toBeVisible();
  await expect(game(page)).toHaveCount(0);
  await expect(page.locator('[data-world] canvas')).toHaveCount(0);
  await page.locator('[data-game-launch]').click();
  await expect(page.locator('[data-start]')).toBeEnabled({ timeout: 40_000 });
  await expect(game(page)).toHaveAccessibleName('لعبة مكشوف');
  await assertCanvasFits(page);
  await page.screenshot({ path: 'test-results/exposed-desktop-intro.png' });
  await start(page);
  const initial = await position(page);
  await page.keyboard.down('KeyW');
  await expect.poll(async () => (await position(page)).z, { timeout: 12_000 }).toBeLessThan(initial.z - 1);
  await page.keyboard.up('KeyW');
  await page.locator('[data-pulse]').click();
  await expect(page.locator('[data-pulse]')).toBeDisabled();
  await expect(page.locator('[data-pulse]')).toContainText('s');
  await page.locator('[data-pause]').click();
  await expect(game(page)).toHaveAttribute('data-mode', 'paused');
  const stopped = await position(page);
  await page.keyboard.down('KeyW');
  await page.keyboard.press('KeyF');
  await expect(game(page)).toHaveAttribute('data-x', stopped.x.toFixed(2));
  await expect(game(page)).toHaveAttribute('data-z', stopped.z.toFixed(2));
  await page.keyboard.up('KeyW');
  await page.getByRole('combobox', { name: 'جودة الرسومات' }).selectOption('low');
  await expect(page.getByRole('combobox', { name: 'جودة الرسومات' })).toHaveValue('low');
  await page.locator('[data-resume]').click();
  await expect(game(page)).toHaveAttribute('data-mode', 'playing');
  await page.screenshot({ path: 'test-results/exposed-desktop-playing.png' });
  await close(page);
  expect(errors).toEqual([]);
});

test('checkpoint restore keeps choices and location sharing can be stopped', async ({ page }) => {
  const errors = pageErrors(page);
  await seed(page, checkpoint);
  await launch(page);
  await expect(page.locator('[data-start]')).toContainText('كمّل مهمتك');
  await start(page);
  await expect(game(page)).toHaveAttribute('data-stage', '2');
  await expect.poll(async () => (await position(page)).x).toBeCloseTo(13, 1);
  await expect.poll(async () => (await position(page)).z).toBeCloseTo(-39, 1);
  await expect(page.locator('[data-navigation]')).toHaveAttribute('data-sharing', 'true');
  await page.locator('[data-navigation]').click();
  await expect(page.locator('[data-navigation]')).toHaveAttribute('aria-pressed', 'false');
  await expect(game(page)).toContainText('آخر نقطة معروفة ما زالت عندهم');
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).choices.navigation, SAVE_KEY)).toBe(false);
  await page.locator('[data-pause]').click();
  await expect(game(page)).toHaveAttribute('data-mode', 'paused');
  await close(page);
  await page.locator('[data-game-launch]').click();
  await expect(page.locator('[data-start]')).toBeEnabled({ timeout: 40_000 });
  await start(page);
  await expect(game(page)).toHaveAttribute('data-stage', '2');
  await expect(page.locator('[data-navigation]')).toHaveAttribute('aria-pressed', 'false');
  await close(page);
  expect(errors).toEqual([]);
});

test('navigation kiosk applies a location sharing decision through the actual UI', async ({ page }) => {
  const errors = pageErrors(page);
  await launch(page);
  await start(page);
  await page.keyboard.down('KeyW');
  await expect(page.locator('[data-interact]')).toBeVisible({ timeout: 25_000 });
  await page.keyboard.up('KeyW');
  await expect(page.locator('[data-interact] kbd')).toHaveText('Enter');
  await page.keyboard.press('Enter');
  await expect(game(page)).toHaveAttribute('data-mode', 'decision');
  await expect(page.getByRole('heading', { name: 'الملاحة', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/exposed-navigation-decision.png' });
  await page.locator('[data-choice=share]').click();
  await expect(game(page)).toHaveAttribute('data-stage', '1');
  await expect(game(page)).toHaveAttribute('data-mode', 'playing');
  await expect(page.locator('[data-navigation]')).toHaveAttribute('data-sharing', 'true');
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).stage, SAVE_KEY)).toBe(1);
  await close(page);
  expect(errors).toEqual([]);
});

test('portrait and landscape support movement, looking and action buttons together', async ({ browser }) => {
  const context: BrowserContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = pageErrors(page);
  try {
    await seed(page, { version: 1, stage: 1, choices: { navigation: false, contacts: false, cloud: false }, seconds: 0, pulses: 0 });
    await launch(page);
    await start(page);
    await expect(game(page)).toHaveAttribute('data-touch', 'true');
    await expect(game(page).getByRole('status')).toHaveCount(0);
    const session = await context.newCDPSession(page);
    for (const size of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
      await page.setViewportSize(size);
      await assertCanvasFits(page);
      const stick = page.locator('[data-joystick]');
      await expect(stick).toBeVisible();
      const box = (await stick.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(size.height + 1);
      const x = box.x + box.width / 2, y = box.y + box.height / 2;
      const lookX = Math.round(size.width * .67), lookY = Math.round(size.height * .47);
      const before = await position(page);
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x, y }] });
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ id: 1, x, y: y - 39 }] });
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x, y: y - 39 }, { id: 2, x: lookX, y: lookY }] });
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ id: 1, x, y: y - 39 }, { id: 2, x: lookX + 45, y: lookY - 15 }] });
      await expect.poll(async () => (await position(page)).z, { timeout: 12_000 }).toBeLessThan(before.z - .45);
      await expect.poll(async () => Math.abs((await position(page)).x - before.x), { timeout: 8_000 }).toBeGreaterThan(.025);
      const touchPoints = [{ id: 1, x, y: y - 39 }, { id: 2, x: lookX + 45, y: lookY - 15 }];
      const buttons = [page.getByRole('button', { name: 'ركض', exact: true }), page.getByRole('button', { name: 'قفز', exact: true }), page.locator('[data-pulse]'), page.getByRole('button', { name: 'انخفاض', exact: true }), page.locator('[data-navigation]')];
      for (const [index, button] of buttons.entries()) {
        const rect = (await button.boundingBox())!;
        touchPoints.push({ id: index + 3, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 });
        await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints });
      }
      await expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
      await expect(buttons[2]).toBeDisabled();
      await expect(buttons[3]).toHaveAttribute('aria-pressed', 'true');
      await expect(buttons[4]).toHaveAttribute('aria-pressed', 'true');
      const moving = await position(page);
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: touchPoints.map(point => point.id === 2 ? { ...point, x: point.x + 30 } : point) });
      await expect.poll(async () => Math.hypot((await position(page)).x - moving.x, (await position(page)).z - moving.z)).toBeGreaterThan(.2);
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      // Releasing a finger must not generate a second toggle through a click.
      await expect(buttons[0]).toHaveAttribute('aria-pressed', 'true');
      await expect(buttons[3]).toHaveAttribute('aria-pressed', 'true');
      await expect(buttons[4]).toHaveAttribute('aria-pressed', 'true');
      await buttons[0].tap();
      await buttons[3].tap();
      await buttons[4].tap();
      await expect(buttons[0]).toHaveAttribute('aria-pressed', 'false');
      await expect(buttons[3]).toHaveAttribute('aria-pressed', 'false');
      await expect(buttons[4]).toHaveAttribute('aria-pressed', 'false');
      await page.screenshot({ path: `test-results/exposed-touch-${size.width > size.height ? 'landscape' : 'portrait'}.png` });
      await page.locator('[data-pause]').tap();
      await expect(game(page)).toHaveAttribute('data-mode', 'paused');
      await page.locator('[data-resume]').tap();
      await expect(game(page)).toHaveAttribute('data-mode', 'playing');
      await expect(page.locator('[data-pulse]')).toBeEnabled({ timeout: 12_000 });
    }
    await session.detach();
    await close(page);
    expect(errors).toEqual([]);
  } finally { await context.close(); }
});

test('blocked storage and external requests do not prevent playing or pausing', async ({ page }) => {
  const errors = pageErrors(page);
  const posts: string[] = [], external: string[] = [];
  page.on('request', request => { if (request.method() === 'POST') posts.push(request.url()); });
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (!['127.0.0.1', 'localhost'].includes(url.hostname)) { external.push(url.toString()); return route.abort(); }
    return route.continue();
  });
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'getItem', { value: () => { throw new DOMException('Storage blocked'); } });
    Object.defineProperty(Storage.prototype, 'setItem', { value: () => { throw new DOMException('Storage blocked'); } });
  });
  await launch(page);
  await start(page);
  const initial = await position(page);
  await page.keyboard.down('ArrowUp');
  await expect.poll(async () => (await position(page)).z).toBeLessThan(initial.z - .3);
  await page.keyboard.up('ArrowUp');
  await page.locator('[data-pause]').click();
  await expect(game(page)).toHaveAttribute('data-mode', 'paused');
  await expect(game(page)).toContainText('التخزين غير متاح');
  await close(page);
  expect(external).toEqual([]);
  expect(posts.filter(url => !url.includes('__nextjs'))).toEqual([]);
  expect(errors).toEqual([]);
});

test('unsupported WebGL shows a readable fallback and restores the page on exit', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, ...args: unknown[]) {
      if (/webgl/i.test(kind)) return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof HTMLCanvasElement.prototype.getContext;
  });
  await page.goto(`${baseURL}/ar/alternatives/#game`);
  await page.locator('[data-game-launch]').click();
  await expect(game(page)).toBeVisible();
  await expect(game(page).getByRole('alert')).toContainText('WebGL');
  await expect(game(page).getByRole('heading', { name: 'تعذّر تشغيل المدينة' })).toBeVisible();
  await game(page).getByRole('button', { name: 'ارجع للبدائل' }).click();
  await expect(game(page)).toHaveCount(0);
  await expect(page.locator('[data-game-launch]')).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

test('English localization and repeated open/close keep one canvas and restore focus', async ({ page }) => {
  test.setTimeout(150_000);
  const errors = pageErrors(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await launch(page, 'en');
  await expect(game(page)).toHaveAccessibleName('Exposed game');
  await expect(game(page)).toHaveAttribute('dir', 'ltr');
  await expect(page.getByRole('heading', { name: 'Every step. Leaves a trace.' })).toBeVisible();
  for (let i = 0; i < 2; i++) {
    await expect(page.locator('[data-world] canvas')).toHaveCount(1);
    await start(page);
    await page.keyboard.press('Escape');
    await expect(game(page)).toHaveAttribute('data-mode', 'paused');
    expect(await game(page).evaluate(node => ({ open: (node as HTMLDialogElement).open, modal: node.matches(':modal') })), `paused iteration ${i}`).toEqual({ open: true, modal: true });
    await page.keyboard.press('Escape');
    await expect(game(page)).toHaveAttribute('data-mode', 'playing');
    expect(await game(page).evaluate(node => ({ open: (node as HTMLDialogElement).open, modal: node.matches(':modal') })), `resumed iteration ${i}`).toEqual({ open: true, modal: true });
    await expect(page.locator('[data-pause]')).toBeVisible({ timeout: 5_000 });
    await page.locator('[data-pause]').click();
    await expect(game(page)).toHaveAttribute('data-mode', 'paused');
    await expect(page.getByRole('button', { name: 'Reduce camera motion' })).toHaveAttribute('aria-pressed', 'true');
    if (i === 0) {
      await page.locator('[data-resume]').focus();
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: 'Fullscreen', exact: true })).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(page.locator('[data-resume]')).toBeFocused();
    }
    await close(page);
    if (i < 1) {
      await page.locator('[data-game-launch]').click();
      await expect(page.locator('[data-start]')).toBeEnabled({ timeout: 40_000 });
    }
  }
  expect(errors).toEqual([]);
});

test('small phone portrait and landscape layouts keep controls on screen', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 568 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  try {
    await seed(page, { version: 1, stage: 1, choices: { navigation: false, contacts: false, cloud: false }, seconds: 0, pulses: 0 });
    await launch(page);
    await start(page);
    for (const size of [{ width: 320, height: 568 }, { width: 568, height: 320 }]) {
      await page.setViewportSize(size);
      await assertCanvasFits(page);
      await expect(page.locator('[data-joystick]')).toBeVisible();
      await expect(page.locator('[data-navigation]')).toBeVisible();
      expect((await page.locator('[data-joystick]').boundingBox())!.width).toBeLessThanOrEqual(96);
      expect((await page.locator('[data-pulse]').boundingBox())!.width).toBeLessThanOrEqual(48);
      for (const name of ['قفز', 'ركض', 'انخفاض']) expect((await page.getByRole('button', { name, exact: true }).boundingBox())!.width).toBeLessThanOrEqual(48);
      for (const selector of ['[data-joystick]', '[data-navigation]', '[data-pulse]', '[data-game-close]']) {
        const box = (await page.locator(selector).boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(size.width + 1);
        expect(box.y + box.height).toBeLessThanOrEqual(size.height + 1);
      }
      await page.screenshot({ path: `test-results/exposed-small-${size.width > size.height ? 'landscape' : 'portrait'}.png` });
    }
    await close(page);
  } finally { await context.close(); }
});

test('soundtrack starts with play, pauses, mutes, and releases its audio context', async ({ page }) => {
  await page.addInitScript(() => {
    const probe = { contexts: [] as AudioContext[], starts: 0, stops: 0, analyser: null as AnalyserNode | null };
    Object.assign(window, { exposedAudioProbe: probe });
    const NativeAudio = window.AudioContext;
    window.AudioContext = class extends NativeAudio {
      constructor() { super(); probe.contexts.push(this); }
      createGain() {
        const gain = super.createGain();
        if (!probe.analyser) { probe.analyser = this.createAnalyser(); gain.connect(probe.analyser); }
        return gain;
      }
      createOscillator() {
        const oscillator = super.createOscillator(), start = oscillator.start.bind(oscillator), stop = oscillator.stop.bind(oscillator);
        oscillator.start = time => { probe.starts++; start(time); };
        oscillator.stop = time => { probe.stops++; stop(time); };
        return oscillator;
      }
    };
  });
  const audio = () => page.evaluate(() => {
    const probe = (window as unknown as { exposedAudioProbe: { contexts: AudioContext[]; starts: number; stops: number; analyser: AnalyserNode | null } }).exposedAudioProbe;
    const samples = new Float32Array(256); probe.analyser?.getFloatTimeDomainData(samples);
    return { starts: probe.starts, stops: probe.stops, states: probe.contexts.map(context => context.state), level: Math.max(...samples.map(Math.abs)) };
  });
  await launch(page);
  expect((await audio()).states).toEqual([]);
  await start(page);
  await expect.poll(async () => (await audio()).level).toBeGreaterThan(.001);
  await expect.poll(async () => (await audio()).starts).toBeGreaterThan(2);
  await page.locator('[data-pause]').click();
  const paused = await audio();
  await page.getByRole('button', { name: 'الصوت شغّال', exact: true }).click();
  await expect.poll(async () => (await audio()).states).toEqual(['suspended']);
  const volume = page.getByRole('slider', { name: 'مستوى الصوت' });
  await volume.focus(); await page.keyboard.press('Home');
  await expect(volume).toHaveValue('0');
  expect((await audio()).starts).toBe(paused.starts);
  await page.getByRole('button', { name: 'الصوت مغلق', exact: true }).click();
  await expect.poll(async () => (await audio()).states).toEqual(['running']);
  await page.locator('[data-resume]').click();
  await expect.poll(async () => (await audio()).starts).toBeGreaterThan(paused.starts);
  await close(page);
  await expect.poll(async () => (await audio()).states).toEqual(['closed']);
});

test('look sensitivity changes touch turning while leaving movement available', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = pageErrors(page), turns: number[] = [];
  try {
    const session = await context.newCDPSession(page);
    for (const [key, expected] of [['Home', '30'], ['End', '150']]) {
      await launch(page); await start(page);
      await page.locator('[data-pause]').tap();
      const sensitivity = page.getByRole('slider', { name: 'حساسية النظر' });
      await sensitivity.focus(); await page.keyboard.press(key);
      await expect(sensitivity).toHaveValue(expected);
      await page.locator('[data-resume]').tap();
      const before = await position(page);
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ id: 1, x: 190, y: 400 }] });
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ id: 1, x: 250, y: 400 }] });
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.keyboard.down('KeyW');
      await expect.poll(async () => (await position(page)).z).toBeLessThan(before.z - 1);
      await page.keyboard.up('KeyW');
      const after = await position(page);
      turns.push(Math.abs((after.x - before.x) / (after.z - before.z)));
      await close(page);
    }
    expect(turns[0]).toBeGreaterThan(.01);
    expect(turns[1]).toBeGreaterThan(turns[0] * 3);
    await session.detach();
    expect(errors).toEqual([]);
  } finally { await context.close(); }
});
