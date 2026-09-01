import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = 'C:\\Users\\adibw\\.gemini\\antigravity-ide\\brain\\f59d3652-52ca-490b-844a-dd8ccd3ac7ef\\screenshots';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const routes = [
  { name: 'Home', url: 'http://localhost:3000/' },
  { name: 'Home_Search', url: 'http://localhost:3000/?search=test' },
  { name: 'Kategori', url: 'http://localhost:3000/kategori' },
  { name: 'Kategori_Detail', url: 'http://localhost:3000/kategori?category=psikologi' },
  { name: 'DetailBuku', url: 'http://localhost:3000/books/cmti2kisr0010h8bvxjh5zblj' },
  { name: 'Penerbit', url: 'http://localhost:3000/penerbit/cmti1au65000dh8bv4pzqco8e' },
  { name: 'Penulis', url: 'http://localhost:3000/penulis/David%20J.%20Lieberman,%20Ph.D.' },
  { name: 'FAQ', url: 'http://localhost:3000/faq' },
  { name: 'Kontak', url: 'http://localhost:3000/kontak' },
  { name: 'TentangKami', url: 'http://localhost:3000/tentang-kami' }
];

const viewports = [
  { name: '360x800', width: 360, height: 800 },
  { name: '375x667', width: 375, height: 667 },
  { name: '390x844', width: 390, height: 844 }
];

const results = [];

(async () => {
  console.log('Starting Playwright...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const route of routes) {
    for (const vp of viewports) {
      console.log(`Testing ${route.name} at ${vp.name}...`);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      try {
        await page.goto(route.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        // wait a bit for animations or hydration
        await page.waitForTimeout(2000);

        // check if 404
        const is404 = await page.evaluate(() => document.title.includes('404') || document.body.innerText.includes('This page could not be found'));
        if (is404) {
          console.log(`Route ${route.name} is 404, skipping.`);
          continue;
        }

        const screenshotName = `${route.name}_${vp.name}.png`;
        const screenshotPath = path.join(outDir, screenshotName);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        // evaluate DOM
        const evalData = await page.evaluate(() => {
          const issues = [];
          
          // Overflow check
          if (document.documentElement.scrollWidth > document.documentElement.clientWidth) {
            issues.push('Horizontal overflow detected on root document');
          }
          const allEls = document.querySelectorAll('*');
          for (const el of allEls) {
            if (el.scrollWidth > el.clientWidth && window.getComputedStyle(el).overflow !== 'hidden' && el.tagName !== 'HTML') {
              issues.push(`Element overflow: <${el.tagName.toLowerCase()} class="${el.className}">`);
              break; // limit to 1
            }
          }

          // Touch targets check
          const interactables = document.querySelectorAll('button, a, input, select');
          let smallTargets = 0;
          for (const el of interactables) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
              smallTargets++;
            }
          }
          if (smallTargets > 0) {
            issues.push(`${smallTargets} interactive elements have touch targets smaller than 44x44px`);
          }

          // Font sizes check
          let smallFonts = 0;
          for (const el of document.querySelectorAll('p, span, div, a')) {
            const style = window.getComputedStyle(el);
            const size = parseFloat(style.fontSize);
            if (size > 0 && size < 12) {
              smallFonts++;
            }
          }
          if (smallFonts > 0) {
            issues.push(`${smallFonts} text elements have font sizes smaller than 12px (too small for mobile)`);
          }

          return issues;
        });

        results.push({
          route: route.name,
          viewport: vp.name,
          screenshot: `screenshots/${screenshotName}`,
          issues: evalData
        });
      } catch (err) {
        console.error(`Error on ${route.name} at ${vp.name}:`, err.message);
      }
    }
  }

  // Also test reading ebook modal
  try {
    console.log(`Testing Baca Ebook modal...`);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(routes.find(r => r.name === 'DetailBuku').url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    // Click button with text 'BACA ONLINE'
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('BACA ONLINE'));
      if(btn) btn.click();
    });
    await page.waitForTimeout(2000);
    const modalPath = path.join(outDir, 'BacaEbook_Modal_390x844.png');
    await page.screenshot({ path: modalPath });
    results.push({
      route: 'BacaEbookModal',
      viewport: '390x844',
      screenshot: `screenshots/BacaEbook_Modal_390x844.png`,
      issues: ['Manual check required for modal overflow and sizing']
    });
  } catch (err) {
    console.error('Modal test failed', err);
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, 'audit_results.json'), JSON.stringify(results, null, 2));
  console.log('Audit complete.');
})();
