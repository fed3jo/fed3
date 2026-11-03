import { test, expect } from '@playwright/test';

test('local cloud has its own navigation, working access diagram and sourced setup steps', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const locale of ['ar', 'en']) {
    await page.setViewportSize({ width: 1440, height: 960 });
    const response = await page.goto(`/${locale}/home-cloud/`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('[data-cloud-guide-hero]')).toContainText(locale === 'ar' ? 'سحابة بتخصّك.' : 'A cloud you run.');
    await expect(page.locator('[data-cloud-guide-hero] a[href*="1CqsiVg5j9hzYkPLR7GyGW_tYCFayS0zrEDtq1Sx0PC4"]')).toHaveCount(1);
    await expect(page.locator('[data-cloud-requirements] table')).toContainText('2 GB RAM');
    await expect(page.locator('[data-cloud-requirements] table')).toContainText('4 GB RAM');
    await expect(page.locator('[data-cloud-daily] details')).toHaveCount(5);
    await page.locator('[data-cloud-daily] details').nth(2).locator('summary').click();
    await expect(page.locator('[data-cloud-daily] details').nth(2)).toHaveAttribute('open', '');
    await expect(page.locator('[data-cloud-daily] details').nth(2).locator('p')).toContainText(locale === 'ar' ? 'تاريخ الانتهاء' : 'expiry date');
    await expect(page.locator('[data-cloud-daily] img')).toHaveAttribute('src', /home-cloud-daily-v1/);
    const nav = page.locator('#cloud-navigation');
    expect(await nav.locator('a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')))).toEqual(['#cloud-overview', '#cloud-flow', '#cloud-steps', '#cloud-readiness']);
    await expect(page.locator('#alternatives-navigation')).toHaveCount(0);
    await page.screenshot({ path: `test-results/cloud-hero-${locale}.png` });
    await nav.locator('a[href="#cloud-flow"]').click();
    await expect(page.locator('#cloud-flow')).toBeFocused();
    const modes = page.getByRole('group', { name: locale === 'ar' ? 'طريقة الوصول' : 'Access method' });
    await modes.getByRole('button').nth(2).click();
    await expect(modes.getByRole('button').nth(2)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#cloud-flow [role="status"]')).toContainText('HTTPS');
    await page.screenshot({ path: `test-results/cloud-flow-${locale}.png` });
    await nav.locator('a[href="#cloud-steps"]').click();
    await expect(page.locator('#cloud-steps ol>li')).toHaveCount(6);
    expect(await page.locator('#cloud-steps a').evaluateAll(nodes => nodes.every(node => node.getAttribute('href')?.startsWith('https://')))).toBe(true);
    await nav.locator('a[href="#cloud-readiness"]').click();
    await expect(page.locator('#cloud-readiness')).toBeFocused();
    await expect(nav.locator('a[href="#cloud-readiness"]')).toHaveAttribute('aria-current', 'location');
    const journey = page.locator('#journey');
    await expect(journey.locator('[data-station]')).toHaveCount(3);
    await expect(journey.locator('[data-station="home-cloud"]')).toHaveAttribute('aria-current', 'location');
    await expect(journey.locator('[data-station="alternatives"]')).toHaveAttribute('href', `/${locale}/alternatives/`);
    await expect(journey.locator('[data-station="communities"]')).toHaveAttribute('href', `/${locale}/communities/`);
    await journey.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `test-results/cloud-journey-${locale}.png` });
    await journey.locator('[data-station="home-cloud"]').click();
    await expect(page.locator('#cloud-overview')).toBeFocused();
  }
});

test('all 13 survey questions can be previewed, preserve local answers and never submit or save', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ar/home-cloud/#cloud-readiness');
  const requests: string[] = [];
  page.on('request', request => { if (request.method() !== 'GET') requests.push(request.url()); });
  const survey = page.locator('[data-readiness-survey]');
  await expect(survey.locator('[data-survey-question]')).toHaveCount(5);
  await survey.getByRole('textbox', { name: 'ما هو اسم المنشأة؟', exact: true }).fill('معاينة الاختبار');
  await survey.getByRole('radio', { name: 'أخرى', exact: true }).check();
  await survey.getByRole('textbox', { name: 'وضّح الإجابة الأخرى' }).fill('معاينة فقط');
  await survey.getByRole('button', { name: 'القسم التالي' }).click();
  await expect(survey.locator('[data-survey-question]')).toHaveCount(4);
  await survey.getByRole('checkbox', { name: 'مشاركة الملفات والمستندات بأمان بين الموظفين', exact: true }).check();
  await survey.getByRole('checkbox', { name: 'حماية خصوصية بيانات الطلاب / الموظفين', exact: true }).check();
  await page.screenshot({ path: 'test-results/cloud-survey-desktop.png' });
  await survey.getByRole('button', { name: 'القسم التالي' }).click();
  await expect(survey.locator('[data-survey-question]')).toHaveCount(4);
  await expect(survey.getByRole('button', { name: 'الإرسال قريبًا', exact: true })).toBeDisabled();
  await expect(survey.locator('form')).not.toHaveAttribute('action', /.+/);
  await survey.getByRole('button', { name: 'عن المؤسسة', exact: true }).click();
  await expect(survey.getByRole('textbox', { name: 'ما هو اسم المنشأة؟', exact: true })).toHaveValue('معاينة الاختبار');
  await expect(survey.getByRole('textbox', { name: 'وضّح الإجابة الأخرى' })).toHaveValue('معاينة فقط');
  await page.reload();
  await expect(survey.getByRole('textbox', { name: 'ما هو اسم المنشأة؟', exact: true })).toHaveValue('');
  expect(requests).toEqual([]);
  const storage = await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage }));
  expect(storage).not.toContain('معاينة الاختبار');
});

test('mobile cloud, app facts and clustered app logos stay contained in both languages', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const locale of ['ar', 'en']) {
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/${locale}/home-cloud/`);
      const menu = page.getByRole('button', { name: locale === 'ar' ? 'التنقّل' : 'Navigation', exact: true });
      const language = page.getByRole('link', { name: locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية', exact: true });
      const menuBox = await menu.boundingBox();
      const languageBox = await language.boundingBox();
      expect(languageBox?.height).toBe(40);
      expect(menuBox?.height).toBe(40);
      expect(Math.abs(languageBox!.y - menuBox!.y)).toBeLessThan(1);
      expect(languageBox!.width).toBeLessThan(100);
      if (width === 390) {
        await page.screenshot({ path: `test-results/header-mobile-${locale}.png` });
        await page.locator('header').screenshot({ path: `test-results/header-bar-mobile-${locale}.png` });
      }
      await menu.click();
      await page.locator('#cloud-navigation a[href="#cloud-readiness"]').click();
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('#cloud-readiness')).toBeFocused();
      await page.locator('[data-readiness-survey]').getByRole('button', { name: locale === 'ar' ? 'الجاهزية التقنية' : 'Technical readiness', exact: true }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (width === 390) await page.screenshot({ path: `test-results/cloud-survey-mobile-${locale}.png` });
      if (width === 390) {
        await page.locator('#journey').scrollIntoViewIfNeeded();
        await page.screenshot({ path: `test-results/cloud-journey-mobile-${locale}.png` });
      }
    }
    await page.setViewportSize({ width: 1440, height: 960 });
    await page.goto(`/${locale}/alternatives/`);
    await expect(page.getByRole('heading', { name: locale === 'ar' ? 'كل تطبيق، قرار عن بياناتك.' : 'Every app is a decision about your data.', exact: true })).toHaveCount(0);
    await expect(page.locator('[data-alternatives-art] image[href^="/app-logos/"]')).toHaveCount(3);
    await page.screenshot({ path: `test-results/cluster-hero-${locale}.png` });
    await page.locator('[data-alternatives-art]').screenshot({ path: `test-results/alternatives-art-${locale}.png` });
    await page.goto(`/${locale}/apps/signal/#app-facts`);
    await expect(page.locator('[data-app-fact]')).toHaveCount(3);
    await page.getByRole('button', { name: /^(استخدامك اليومي|Everyday use)/ }).click();
    await expect(page.locator('[data-app-fact]')).toHaveCount(3);
    await expect(page.locator('[data-app-fact] h3')).toHaveText(locale === 'ar' ? ['الوظائف اليومية','الأجهزة المدعومة','التكلفة'] : ['Everyday features','Supported devices','Cost']);
    await page.screenshot({ path: `test-results/app-facts-${locale}.png` });
  }
  expect(errors).toEqual([]);
});
