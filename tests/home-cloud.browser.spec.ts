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

test('published survey validates required answers, sends once with consent and does not save a local draft', async ({ page }) => {
  test.skip(process.env.CMS_TEST_FIXTURE!=='1','Requires the local engagement fixture, never production.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/ar/home-cloud/#cloud-readiness');
  const survey=page.locator('[data-readiness-survey]');
  await expect(survey.locator('[data-survey-question]')).toHaveCount(6);
  await survey.getByRole('button',{name:'القسم التالي',exact:true}).click();
  await expect(survey.getByRole('alert')).toContainText('ما هو اسم المنشأة');
  await survey.getByRole('textbox',{name:'ما هو اسم المنشأة؟',exact:true}).fill('اختبار محلي للفورم');
  await survey.getByRole('radio',{name:'جمعية',exact:true}).check();
  await survey.getByRole('textbox',{name:'رقم التواصل / البريد الإلكتروني للمنشأة',exact:true}).fill('team@example.test');
  await survey.getByRole('textbox',{name:'المسمى الوظيفي واسم الشخص المسؤول عن التنسيق مع المبادرة',exact:true}).fill('مسؤول تجريبي');
  await survey.getByRole('textbox',{name:'رقم ووسيلة التواصل مع مسؤول التنسيق',exact:true}).fill('coordinator@example.test');
  await survey.getByRole('button',{name:'القسم التالي',exact:true}).click();
  await survey.getByRole('radio',{name:/توجد شبكة محلية/}).check();
  await survey.getByRole('radio',{name:/نعم، يتوفر جهاز سليم/}).check();
  await survey.getByRole('radio',{name:'أقل من 10 مستخدمين',exact:true}).check();
  await survey.getByRole('checkbox',{name:'مشاركة الملفات والمستندات بأمان بين الموظفين',exact:true}).check();
  await survey.getByRole('button',{name:'القسم التالي',exact:true}).click();
  await expect(survey.getByRole('alert')).toHaveCount(0);
  await survey.getByRole('radio',{name:/^نعم \(/}).check();
  await survey.getByRole('radio',{name:'نرغب بتدريب شخص أو شخصين فقط',exact:true}).check();
  await survey.getByRole('radio',{name:/نعم، موافقون وجاهزون/}).check();
  await survey.getByRole('checkbox',{name:/أوافق على إرسال/}).check();
  const request=page.waitForResponse(r=>r.url().includes('/api/engagement/form/submit/')&&r.request().method()==='POST');
  await survey.getByRole('button',{name:'إرسال الإجابات',exact:true}).click();
  expect((await request).status()).toBe(200);
  await expect(page.locator('[data-survey-success]')).toContainText('100%');
  expect(await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}))).not.toContain('اختبار محلي للفورم');
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
      if(process.env.CMS_TEST_FIXTURE==='1')await expect(page.locator('[data-readiness-survey]')).toBeVisible();
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
