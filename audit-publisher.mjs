import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = 'http://localhost:3000';
const outputDir = path.join(process.cwd(), 'audit_screenshots');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const pages = [
    { name: 'beranda', path: '/publisher' },
    { name: 'tentang', path: '/publisher/tentang-kami' },
    { name: 'faq', path: '/publisher/faq' },
    { name: 'kontak', path: '/publisher/kontak' },
    { name: 'login', path: '/publisher/auth/login' },
    { name: 'register', path: '/publisher/auth/register' },
    { name: 'forgot_password', path: '/publisher/auth/forgot-password' }
];

const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile_360', width: 360, height: 800 },
    { name: 'mobile_375', width: 375, height: 667 },
    { name: 'mobile_390', width: 390, height: 844 }
];

async function captureScreenshots() {
    console.log('Starting Playwright...');
    const browser = await chromium.launch({ headless: true });
    
    for (const pageInfo of pages) {
        console.log(`\nProcessing page: ${pageInfo.name} (${pageInfo.path})`);
        const pageDir = path.join(outputDir, pageInfo.name);
        if (!fs.existsSync(pageDir)) {
            fs.mkdirSync(pageDir, { recursive: true });
        }
        
        for (const vp of viewports) {
            console.log(`  Viewport: ${vp.name} (${vp.width}x${vp.height})`);
            const context = await browser.newContext({
                viewport: { width: vp.width, height: vp.height },
                deviceScaleFactor: 1,
            });
            const page = await context.newPage();
            
            try {
                // Wait until network is mostly idle to ensure fonts/images load
                await page.goto(`${baseUrl}${pageInfo.path}`, { waitUntil: 'networkidle' });
                
                // Allow animations to finish
                await page.waitForTimeout(2000); 

                // Full page screenshot
                await page.screenshot({ 
                    path: path.join(pageDir, `${vp.name}_full.png`), 
                    fullPage: true 
                });

                // Try capturing navbar (header)
                try {
                    const header = page.locator('header').first();
                    if (await header.count() > 0) {
                        await header.screenshot({ path: path.join(pageDir, `${vp.name}_header.png`) });
                    }
                } catch (e) { /* ignore */ }

                // Try capturing hero section (first main section or div)
                try {
                    const hero = page.locator('main > section:first-of-type, main > div:first-child').first();
                    if (await hero.count() > 0) {
                        await hero.screenshot({ path: path.join(pageDir, `${vp.name}_hero.png`) });
                    }
                } catch (e) { /* ignore */ }

                // Try capturing form (for auth pages)
                try {
                    if (pageInfo.name === 'login' || pageInfo.name === 'register' || pageInfo.name === 'forgot_password') {
                        const form = page.locator('form').first();
                        if (await form.count() > 0) {
                            await form.screenshot({ path: path.join(pageDir, `${vp.name}_form.png`) });
                        }
                    }
                } catch (e) { /* ignore */ }
                
                // Try capturing footer
                try {
                    const footer = page.locator('footer').first();
                    if (await footer.count() > 0) {
                        await footer.screenshot({ path: path.join(pageDir, `${vp.name}_footer.png`) });
                    }
                } catch (e) { /* ignore */ }

            } catch (err) {
                console.error(`  Error processing ${pageInfo.name} at ${vp.name}: ${err.message}`);
            } finally {
                await context.close();
            }
        }
    }
    
    await browser.close();
    console.log('\nAudit screenshots completed!');
}

captureScreenshots().catch(console.error);
