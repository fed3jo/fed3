import { test, expect, type Page } from '@playwright/test';
test.use({ viewport: { width: 960, height: 600 }, deviceScaleFactor: 1 });

async function walk(page: Page, axis: 'x' | 'z', target: number, sprint = false) {
  const root = page.locator('[data-exposed-game]');
  await page.keyboard.press('KeyP');
  await expect.poll(async () => {
      const mode = await root.getAttribute('data-mode');
      if (mode !== 'paused') throw new Error(`Movement stopped in ${mode}`);
      const value = Number(await root.getAttribute(`data-${axis}`));
      if (Math.abs(target - value) < .65) return true;
      const positive = target > value;
      const key = axis === 'x' ? positive ? 'KeyD' : 'KeyA' : positive ? 'KeyS' : 'KeyW';
      await page.keyboard.press('KeyP');
      await page.keyboard.press('KeyF');
      await page.keyboard.press(sprint ? `Shift+${key}` : key, { delay: Math.max(80, Math.min(1800, Math.abs(target - value) / (sprint ? 8.2 : 4.8) * 1000 - 35)) });
      await page.keyboard.press('KeyP');
      return false;
    }, { timeout: 60000, intervals: [50] }).toBe(true);
  await page.keyboard.press('KeyP');
}

test('complete the city route with independent files', async ({ page }) => {
  test.setTimeout(420000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/ar/alternatives/#game');
  await page.locator('[data-game-launch]').click();
  await page.locator('[data-start]').click();
  await page.locator('[data-briefing-start]').click();
  await page.locator('[data-pause]').click();
  await page.getByRole('combobox').selectOption('low');
  await page.locator('[data-resume]').click();
  await page.screenshot({ path: 'test-results/exposed-city-final.png' });
  await page.screenshot({ path: 'test-results/exposed-workshop.jpg', type: 'jpeg', quality: 85 });
  await walk(page, 'z', -2.1);
  await page.locator('[data-interact]').click();
  await expect(page.locator('#decision-title')).toContainText('أقصر طريق');
  await page.locator('[data-choice="private"]').click();
  await expect(page.locator('[data-exposed-game]')).toHaveAttribute('data-stage', '1');
  await walk(page, 'x', 1.8);
  await walk(page, 'z', -9);
  await walk(page, 'x', 0);
  await walk(page, 'z', -43, true);
  await walk(page, 'x', 12);
  await page.locator('[data-interact]').click();
  await page.locator('[data-choice="private"]').click();
  await page.locator('[data-team-code]').fill('1407');
  await page.locator('[data-unlock]').click();
  await walk(page, 'x', 0);
  await walk(page, 'z', -83, true);
  await walk(page, 'x', -11);
  await page.locator('[data-interact]').click();
  await page.locator('[data-choice="private"]').click();
  await walk(page, 'x', 0);
  await walk(page, 'z', -125.5, true);
  await page.locator('[data-interact]').click();
  await expect(page.locator('[data-exposed-game]')).toHaveAttribute('data-mode', 'won');
  await expect(page.getByRole('heading', { name: 'وصلت. والملفات بإيدك.' })).toBeVisible();
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'test-results/exposed-route-complete.png' });
});
