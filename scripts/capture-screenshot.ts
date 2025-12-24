import { chromium } from 'playwright';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function captureScreenshot() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5000...');
  
  try {
    await page.goto('http://localhost:5000', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    console.log('Waiting for page to stabilize...');
    await page.waitForTimeout(3000);

    const screenshotPath = join(process.cwd(), 'screenshot.png');
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });

    console.log(`✅ Screenshot saved to: ${screenshotPath}`);

    const html = await page.content();
    const htmlPath = join(process.cwd(), 'page-source.html');
    writeFileSync(htmlPath, html);
    console.log(`✅ HTML source saved to: ${htmlPath}`);

    const title = await page.title();
    console.log(`\nPage title: ${title}`);

    const url = page.url();
    console.log(`Current URL: ${url}`);

    const bodyText = await page.evaluate(() => {
      return document.body.innerText.substring(0, 500);
    });
    console.log(`\nPage content preview:\n${bodyText}...`);

  } catch (error) {
    console.error('❌ Error capturing screenshot:', error);
    throw error;
  } finally {
    await browser.close();
    console.log('\n✅ Browser closed');
  }
}

captureScreenshot().catch(console.error);
