import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Artifact directory
const outDir = 'C:\\Users\\adibw\\.gemini\\antigravity-ide\\brain\\8fb5446d-1859-4642-ae42-c538eaba7c0c\\screenshots';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const routes = [
  { name: 'Dashboard', url: 'http://localhost:3000/admin/dashboard' },
  { name: 'Reports', url: 'http://localhost:3000/admin/reports' },
  { name: 'ManagePublishers', url: 'http://localhost:3000/admin/publishers' },
  { name: 'ManageEbooks', url: 'http://localhost:3000/admin/books' },
  { name: 'Categories', url: 'http://localhost:3000/admin/categories' },
  { name: 'Announcements', url: 'http://localhost:3000/admin/announcements' },
  { name: 'AuditLog', url: 'http://localhost:3000/admin/audit' }
];

const viewports = [
  { name: 'Desktop', width: 1440, height: 900 },
  { name: 'Mobile_360x800', width: 360, height: 800 },
  { name: 'Mobile_375x667', width: 375, height: 667 },
  { name: 'Mobile_390x844', width: 390, height: 844 }
];

const results = [];

(async () => {
  console.log('Starting Playwright...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Login
  console.log('Logging in...');
  await page.goto('http://localhost:3000/admin/auth/login');
  await page.fill('input[type="email"]', 'admin@libra.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
  console.log('Logged in successfully.');

  for (const route of routes) {
    for (const vp of viewports) {
      console.log(`Testing ${route.name} at ${vp.name}...`);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      
      try {
        await page.goto(route.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(1000); // Wait for data fetching/rendering

        const isDesktop = vp.name === 'Desktop';
        
        // 1. Initial State Screenshot
        const initialShot = `${route.name}_${vp.name}_Initial.png`;
        await page.screenshot({ path: path.join(outDir, initialShot), fullPage: true });

        // 2. Mobile specific checks (Menu / Drawer)
        if (!isDesktop) {
          const menuBtn = await page.$('button[aria-label="Buka menu"]');
          if (menuBtn) {
            await menuBtn.click({ force: true });
            await page.waitForTimeout(500); // Wait for animation
            const menuShot = `${route.name}_${vp.name}_MenuOpen.png`;
            await page.screenshot({ path: path.join(outDir, menuShot), fullPage: false });
            
            // Close menu
            const closeBtn = await page.$('button[aria-label="Tutup sidebar"]');
            if (closeBtn) {
              await closeBtn.click({ force: true });
              await page.waitForTimeout(500);
            } else {
              // fallback click backdrop
              await page.mouse.click(10, 10);
              await page.waitForTimeout(500);
            }
          }
        }

        // 3. Page specific checks (Tinjau Konten in ManageEbooks)
        if (route.name === 'ManageEbooks') {
          // Find button with text 'Tinjau Konten' and click it using evaluate
          await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const reviewBtn = btns.find(b => b.textContent.includes('Tinjau Konten'));
            if (reviewBtn) reviewBtn.click();
          });
          
          await page.waitForTimeout(1000); // Wait for modal animation
          const modalShot = `${route.name}_${vp.name}_ModalTinjau.png`;
          await page.screenshot({ path: path.join(outDir, modalShot), fullPage: false });
        }

      } catch (err) {
        console.error(`Error on ${route.name} at ${vp.name}:`, err.message);
      }
    }
  }

  await browser.close();
  console.log('Audit complete.');
})();
