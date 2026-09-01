import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Kita simpan screenshot ke folder hasil untuk dilihat.
const outDir = 'C:\\Users\\adibw\\.gemini\\antigravity-ide\\brain\\0220f0cb-1acc-410e-a7ab-281bcf5647d0\\screenshots';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Data dinamis sesuai permintaan user
const searchKeyword = "tan malaka";
const categoryQuery = "bisnis";
const sampleBookId = "cmti2kisr0010h8bvxjh5zblj"; // Diambil dari script sebelumnya karena ini ada di database lokal, tapi kita akan cari buku pertama yang ada kalau ini tidak ketemu.
const samplePublisherId = "cmti1au65000dh8bv4pzqco8e";
const sampleAuthorName = "David%20J.%20Lieberman,%20Ph.D.";

const routes = [
  { name: '1_Home', url: 'http://localhost:3000/' },
  { name: '2_Kategori_Utama', url: 'http://localhost:3000/kategori' },
  { name: '3_Kategori_Detail', url: `http://localhost:3000/kategori?category=${categoryQuery}` },
  { name: '4_Detail_Buku', url: `http://localhost:3000/books/${sampleBookId}` },
  { name: '5_Detail_Penerbit', url: `http://localhost:3000/penerbit/${samplePublisherId}` },
  { name: '6_Detail_Penulis', url: `http://localhost:3000/penulis/${sampleAuthorName}` },
  { name: '7_FAQ', url: 'http://localhost:3000/faq' },
  { name: '8_Kontak', url: 'http://localhost:3000/kontak' },
  { name: '9_Tentang_Kami', url: 'http://localhost:3000/tentang-kami' }
];

const viewports = [
  { name: '1366x768', width: 1366, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1920x1080', width: 1920, height: 1080 }
];

(async () => {
  console.log('Starting Playwright for Desktop Audit...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  for (const route of routes) {
    for (const vp of viewports) {
      console.log(`Testing ${route.name} at ${vp.name}...`);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      try {
        await page.goto(route.url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000); // Wait for images/animations

        const screenshotPath = path.join(outDir, `${route.name}_${vp.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });

      } catch (err) {
        console.error(`Error on ${route.name} at ${vp.name}:`, err.message);
      }
    }
  }

  // Khusus untuk state: Pencarian Aktif & Hasil Pencarian
  console.log('Testing Search States...');
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    try {
      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      
      // Cari input text pencarian, isi dengan 'tan malaka'
      const searchInput = await page.$('input[type="text"], input[placeholder*="cari"], input[placeholder*="Cari"]');
      if (searchInput) {
        await searchInput.click();
        await searchInput.fill(searchKeyword);
        await page.waitForTimeout(1500); // Wait for dropdown to show
        await page.screenshot({ path: path.join(outDir, `10_Pencarian_Aktif_${vp.name}.png`) });

        // Tekan enter untuk mencari
        await searchInput.press('Enter');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(outDir, `11_Hasil_Pencarian_${vp.name}.png`), fullPage: true });
      } else {
        console.log(`[Search Input not found for ${vp.name}]`);
      }
    } catch(err) {
      console.error(`Error in search test at ${vp.name}:`, err.message);
    }
  }

  // Khusus untuk state: Baca Ebook Modal
  console.log('Testing Ebook Modal State...');
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    try {
      await page.goto(`http://localhost:3000/books/${sampleBookId}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      
      const btn = await page.evaluateHandle(() => {
        const btns = Array.from(document.querySelectorAll('button, a'));
        return btns.find(b => b.textContent && b.textContent.toUpperCase().includes('BACA') || b.textContent.toUpperCase().includes('READ'));
      });
      if (btn) {
        await btn.click();
        await page.waitForTimeout(2000); // Wait for modal to render
        await page.screenshot({ path: path.join(outDir, `12_Baca_Ebook_${vp.name}.png`) });
      } else {
        console.log(`[Baca Ebook Button not found for ${vp.name}]`);
      }
    } catch (err) {
      console.error(`Error in ebook modal test at ${vp.name}:`, err.message);
    }
  }

  await browser.close();
  console.log('Audit screenshots complete.');
})();
