const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport size
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Navigate to the page
  await page.goto('http://localhost:3000');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Take screenshot
  await page.screenshot({ path: 'workflowui-screenshot.png', fullPage: true });

  console.log('Screenshot saved to workflowui-screenshot.png');

  await browser.close();
})();
