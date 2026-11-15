import { expect, test } from '@playwright/test';
import { alternatives } from '../lib/fed3/alternatives';
import { comparisonGroups } from '../lib/fed3/comparison-layout';
import { comparisonBriefs } from '../lib/fed3/comparison-briefs';
import { appStart } from '../lib/fed3/app-start';

for (const locale of ['ar', 'en'] as const) {
  test(`visual comparisons retain every fact, qualifier and source for all five apps (${locale})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/alternatives/?app=brave#comparison`);
    await expect(page.locator('#comparison [data-app-name]')).toHaveText(['Google Chrome', 'Brave']);
    for (const app of alternatives) {
      await page.locator('[data-comparison-picker]>button').click();
      await page.locator(`[data-comparison-option="${app.id}"]`).click();
      await expect(page.locator('#comparison [data-app-name]')).toHaveText([app.current, app.name]);
      await expect(page.locator(`[data-comparison-topic="${appStart[app.id].firstCriterion}"]`)).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('[data-comparison-row]')).toHaveCount(10);
      await expect(page.locator('#comparison table')).toHaveCount(0);
      for (const row of app.rows) {
        const element = page.locator(`[data-comparison-row="${row.key}"]`);
        expect(await element.locator('[data-comparison-full=current] p').textContent()).toBe(row.current[locale]);
        expect(await element.locator('[data-comparison-full=alternative] p').textContent()).toBe(row.alternative[locale]);
        expect(await element.locator('[data-comparison-current] p').textContent()).toBe(comparisonBriefs[app.id][row.key].current[locale].replaceAll('**', ''));
        expect(await element.locator('[data-comparison-alternative] p').textContent()).toBe(comparisonBriefs[app.id][row.key].alternative[locale].replaceAll('**', ''));
        await expect(element.locator('[data-comparison-current] mark')).toHaveCount(1);
        expect(await element.locator('[data-comparison-alternative] mark').count()).toBeGreaterThan(0);
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
      await expect(page.locator('#comparison a[data-download]').first()).toHaveAttribute('href', app.download);
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

  test(`branded picker supports dismissal and offers clear official download actions (${locale})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/alternatives/?app=brave#comparison`);
    await expect(page.locator('#comparison [data-app-name]')).toHaveText(['Google Chrome', 'Brave']);
    await expect(page.locator('#comparison select')).toHaveCount(0);
    const trigger = page.locator('[data-comparison-picker]>button');
    await trigger.click();
    await expect(page.locator('[data-comparison-option]')).toHaveCount(5);
    await expect(page.locator('[data-comparison-option] img')).toHaveCount(10);
    await expect(page.locator('[data-comparison-option=brave]')).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Escape');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.locator('#comparison-heading').click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    for (const app of alternatives) {
      await trigger.click();
      await page.locator(`[data-comparison-option="${app.id}"]`).click();
      const action = page.locator('#comparison a[data-download]').first();
      await expect(action).toHaveAttribute('aria-label', appStart[app.id].downloadLabel[locale]);
      await expect(action).toHaveAttribute('href', app.download);
      await expect(page.locator('#comparison ol>li')).toHaveCount(0);
      await expect(page.locator('#comparison a[data-download]')).toHaveCount(1);
    }
  });
}
