import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('fed3-locale', location.pathname.startsWith('/en') ? 'en' : 'ar'); sessionStorage.setItem('fed3-mode','simple'); });
});

test('the first server-rendered view already contains particles on desktop and mobile', async ({ browser }) => {
  const context=await browser.newContext({ javaScriptEnabled:false });
  const page=await context.newPage();
  const images:string[]=[]; page.on('request',request=>{if(request.resourceType()==='image')images.push(request.url());});
  for (const [width,height,variant] of [[1440,900,'desktop'],[390,844,'mobile'],[320,740,'narrow']] as const) {
    await page.setViewportSize({width,height});
    await page.goto(`${process.env.TEST_BASE_URL || 'http://localhost:3000'}/ar/`);
    const preview=page.locator('[data-particle-preview] img');
    await expect(preview).toBeVisible();
    expect(await preview.evaluate(img=>(img as HTMLImageElement).currentSrc)).toContain(`${variant}-ar.webp`);
    expect(await preview.evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  expect(images.some(url=>url.includes('mountain-navy'))).toBe(false);
  await context.close();
});

test('the overview stays readable beside or above the mountain in both languages', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  for (const locale of ['ar','en']) for (const [width,height] of [[1905,970],[1832,868],[1440,900],[1280,720],[1024,700],[768,1024],[390,844],[320,740],[844,390]]) {
    await page.setViewportSize({width,height}); await page.goto(`/${locale}/`);
    await expect(page.locator('[data-terrain]')).toHaveAttribute('data-renderer','webgl');
    const identity=await page.locator('[data-initiative-identity]').boundingBox();
    const terrain=await page.locator('[data-terrain]').boundingBox();
    const header=await page.locator('header').boundingBox();
    expect(identity!.y).toBeGreaterThanOrEqual(header!.y+header!.height);
    if (locale === 'ar' && width >= 1200) expect(terrain!.y).toBeLessThanOrEqual(identity!.y);
    else expect(identity!.y+identity!.height+8).toBeLessThanOrEqual(terrain!.y+1);
    await expect(page.locator('[data-initiative-identity] h1')).toBeInViewport({ratio:1});
    await expect(page.locator('[data-initiative-identity] p').last()).toBeInViewport({ratio:1});
    await expect(page.locator('[data-initiative-identity] img')).toHaveCount(0);
    await expect(page.locator('[data-initiative-identity]')).not.toContainText(/بياناتك|Your data/);
    expect(identity!.x).toBeGreaterThanOrEqual(0);
    expect(identity!.x+identity!.width).toBeLessThanOrEqual(width+1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  }
});

test('the complete cloud picture and captions fit beside the copy on desktop', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  for (const [width,height] of [[1905,970],[1440,900],[1024,768]]) {
    await page.setViewportSize({width,height}); await page.goto('/ar/home-cloud/');
    const image=page.locator('[data-cloud-guide-hero] figure>img');
    await expect(image).toHaveCSS('object-fit','contain');
    await expect(image).toBeInViewport({ratio:1});
    await expect(page.locator('[data-cloud-guide-hero] figcaption')).toBeInViewport({ratio:1});
    expect(await image.evaluate(img=>img.getBoundingClientRect().bottom)).toBeLessThanOrEqual(height);
  }
});
