import { expect, test } from '@playwright/test';
import { alternatives } from '../lib/fed3/alternatives';
import { comparisonGroups } from '../lib/fed3/comparison-layout';

for (const locale of ['ar', 'en'] as const) {
  test(`visual comparisons retain every fact, qualifier and source for all five apps (${locale})`, async ({ page }) => {
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
        const tab = page.locator(`[data-comparison-group="${group.id}"]`);
        await tab.click();
        await expect(tab).toHaveAttribute('aria-selected', 'true');
        await expect(page.getByRole('tab', { selected: true })).toHaveCount(1);
        for (const criterion of group.criteria) {
          await page.locator(`[data-comparison-topic="${criterion}"]`).click();
          await expect(page.locator('[data-comparison-row]:visible')).toHaveCount(1);
          await expect(page.locator(`[data-comparison-row="${criterion}"]`)).toBeVisible();
        }
      }
      await page.locator('[data-comparison-topic=portability]').click();
      const source = page.locator('[data-comparison-row=portability] details');
      await source.locator('summary').click();
      await expect(source.locator('a').first()).toBeVisible();
      await expect(page.locator('#comparison a[data-download]')).toHaveAttribute('href', app.download);
    }
  });

  test(`paired visuals, tab keyboard navigation and deep links stay usable (${locale})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const width of [320, 390, 768, 1440, 1905]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/alternatives/?app=nextcloud&group=cost#comparison`);
      await expect(page.locator('#comparison [data-app-name]')).toHaveText(['Google Drive', 'Nextcloud']);
      await page.evaluate(() => document.fonts.ready);
      const row = page.locator('[data-comparison-row=cost]');
      const current = (await row.locator('[data-comparison-current]').boundingBox())!;
      const alternative = (await row.locator('[data-comparison-alternative]').boundingBox())!;
      expect(locale === 'ar' ? current.x > alternative.x : current.x < alternative.x).toBe(true);
      expect(Math.abs(current.y - alternative.y)).toBeLessThan(1);
      expect(current.x).toBeGreaterThanOrEqual(0);
      expect(alternative.x + alternative.width).toBeLessThanOrEqual(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const cost = page.locator('[data-comparison-group=cost]');
      await cost.focus();
      await page.keyboard.press('End');
      await expect(page.locator('[data-comparison-group=migration]')).toHaveAttribute('aria-selected', 'true');
      await page.locator('[data-comparison-topic=limitations]').click();
      await expect(page).toHaveURL(/criterion=limitations/);
      await page.reload();
      await expect(page.locator('[data-comparison-topic=limitations]')).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[data-comparison-row=limitations]')).toBeVisible();
    }
  });
}
