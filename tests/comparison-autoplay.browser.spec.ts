import { expect, test } from '@playwright/test';

for (const locale of ['ar', 'en']) {
  test(`reading rotation advances only in view and pauses for sources and manual choices (${locale})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.clock.install();
    await page.goto(`/${locale}/alternatives/?app=signal&group=privacy&criterion=encryption#comparison`);
    const rotation = page.locator('[data-comparison-auto]');
    const point = (id: string) => page.locator(`[data-comparison-topic=${id}]`);
    await expect(rotation).toBeVisible();
    const duration = Number(await rotation.getAttribute('data-reading-duration'));
    await page.locator('[data-comparison-row=encryption] [data-comparison-current]').scrollIntoViewIfNeeded();
    await expect(rotation).toHaveAttribute('data-running', 'true');
    await page.clock.fastForward(duration + 100);
    await expect(point('collection')).toHaveAttribute('aria-pressed', 'true');

    const details = page.locator('[data-comparison-row=collection] details');
    await details.locator('summary').click();
    await expect(rotation).toHaveAttribute('data-running', 'false');
    await page.clock.fastForward(30000);
    await expect(point('collection')).toHaveAttribute('aria-pressed', 'true');
    await details.locator('summary').click();
    await page.locator('[data-comparison-row=collection] [data-comparison-current]').scrollIntoViewIfNeeded();
    await expect(rotation).toHaveAttribute('data-running', 'true');
    await page.clock.fastForward(25000);
    await expect(point('ads')).toHaveAttribute('aria-pressed', 'true');

    await point('account').click();
    await expect(rotation.locator('button')).toHaveAttribute('aria-pressed', 'true');
    await page.clock.fastForward(30000);
    await expect(point('account')).toHaveAttribute('aria-pressed', 'true');
    await rotation.locator('button').click();
    await page.locator('[data-comparison-row=account] [data-comparison-current]').scrollIntoViewIfNeeded();
    await expect(rotation).toHaveAttribute('data-running', 'true');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(rotation).toHaveAttribute('data-running', 'false');
    await page.clock.fastForward(30000);
    await expect(point('account')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-comparison-row=account] [data-comparison-current]').scrollIntoViewIfNeeded();
    await expect(rotation).toHaveAttribute('data-running', 'true');
    await page.clock.fastForward(25000);
    await expect(point('encryption')).toHaveAttribute('aria-pressed', 'true');
  });

  test(`reduced motion and single-topic groups do not rotate (${locale})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/alternatives/?app=signal#comparison`);
    await expect(page.locator('#comparison [data-app-name]')).toHaveText(['WhatsApp', 'Signal']);
    await expect(page.locator('[data-comparison-auto]')).toHaveCount(0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('[data-comparison-auto]')).toHaveCount(1);
    await page.locator('[data-comparison-group=cost]').click();
    await expect(page.locator('[data-comparison-auto]')).toHaveCount(0);
  });
}
