import { chromium } from '/home/linuxuser/Documents/GitHub/metabuilder/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(20000);

await page.goto('https://metabuilder.wardcrew.com/postgres/admin/login');
await page.fill('input[type="text"]', 'admin');
await page.fill('input[type="password"]', 'G38Rhim3FRCiFoetZMbVM4rnzvTyeAkS');
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard**', { timeout: 10000 }).catch(() => {});

await page.goto('https://metabuilder.wardcrew.com/postgres/admin/dashboard/table-manager');
await page.waitForTimeout(2000);

await page.locator('button:has-text("Create Table")').first().click();
await page.waitForTimeout(1000);

// Screenshot the full dialog
const dialog = page.locator('[role="dialog"]').first();
await dialog.screenshot({ path: '/tmp/dialog-full.png' });
console.log('dialog-full.png saved');

// Get the column row box
const colBox = page.locator('[role="dialog"] [style*="flex"]').first();
const colBoxHtml = await colBox.innerHTML();
console.log('Column box HTML:', colBoxHtml);

// Get computed style on all direct children of the flex box
const children = await colBox.evaluate(el => {
  return Array.from(el.children).map(c => ({
    tag: c.tagName,
    class: c.className,
    style: c.getAttribute('style'),
    text: c.textContent?.trim().substring(0, 60),
    computedDisplay: getComputedStyle(c).display,
    computedFlex: getComputedStyle(c).flex,
  }));
});
console.log('Flex children:', JSON.stringify(children, null, 2));

await browser.close();
