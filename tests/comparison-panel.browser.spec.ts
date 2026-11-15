import { expect, test } from '@playwright/test';
import { alternatives } from '../lib/fed3/alternatives';
import { comparisonGroups } from '../lib/fed3/comparison-layout';

for (const locale of ['ar', 'en'] as const) {
  test(`grouped comparisons retain every fact, qualifier and source for all five apps (${locale})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/alternatives/?app=brave#comparison`);
    await expect(page.locator('#comparison [data-app-name]')).toHaveText(['Google Chrome', 'Brave']);
    const picker = page.getByRole('combobox', { name: locale === 'ar' ? 'اختر المقارنة' : 'Choose a comparison', exact: true });
    for (const app of alternatives) {
      await picker.selectOption(app.id);
      await expect(page.locator('#comparison [data-app-name]')).toHaveText([app.current, app.name]);
      await expect(page.locator('[data-comparison-row]')).toHaveCount(10);
      await expect(page.locator('#comparison table')).toHaveCount(0);
      for (const row of app.rows) {
        const element = page.locator(`[data-comparison-row="${row.key}"]`);
        expect(await element.locator('[data-comparison-current] p').textContent()).toBe(row.current[locale]);
        expect(await element.locator('[data-comparison-alternative] p').textContent()).toBe(row.alternative[locale]);
        expect(await element.locator('details a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))).toEqual(row.sources.map(index => app.sources[index].url));
      }
      expect(await page.locator('[data-comparison-row] mark').count()).toBeGreaterThan(0);
      for (const group of comparisonGroups) {
        const trigger = page.locator(`[data-comparison-group="${group.id}"] h3>button`);
        if (await trigger.getAttribute('aria-expanded') !== 'true') await trigger.click();
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(page.locator('[data-comparison-group] h3>button[aria-expanded=true]')).toHaveCount(1);
        await expect(page.locator('[data-comparison-row]:visible')).toHaveCount(group.criteria.length);
        await expect(trigger).toBeInViewport({ ratio: 1 });
      }
      const source = page.locator('[data-comparison-row=portability] details');
      await source.locator('summary').click();
      await expect(source.locator('a').first()).toBeVisible();
      await expect(page.locator('#comparison a[data-download]')).toHaveAttribute('href', app.download);
    }
  });

  test(`responsive comparison cells, keyboard toggles and collapsed links stay usable (${locale})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const width of [320, 390, 768, 1440, 1905]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/alternatives/?app=nextcloud&group=cost#comparison`);
      await expect(page.locator('#comparison [data-app-name]')).toHaveText(['Google Drive', 'Nextcloud']);
      await page.evaluate(() => document.fonts.ready);
      const row = page.locator('[data-comparison-row=cost]');
      const current = (await row.locator('[data-comparison-current]').boundingBox())!;
      const alternative = (await row.locator('[data-comparison-alternative]').boundingBox())!;
      if (width <= 800) expect(current.y + current.height).toBeLessThan(alternative.y);
      else expect(locale === 'ar' ? current.x > alternative.x : current.x < alternative.x).toBe(true);
      expect(current.x).toBeGreaterThanOrEqual(0);
      expect(alternative.x + alternative.width).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const toggle = page.locator('[data-comparison-group=cost] h3>button');
      await toggle.focus();
      await page.keyboard.press('Enter');
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('[data-comparison-row]:visible')).toHaveCount(0);
      await expect(page).toHaveURL(/group=none/);
      await page.reload();
      await expect(page.locator('[data-comparison-group] h3>button[aria-expanded=true]')).toHaveCount(0);
    }
  });
}
