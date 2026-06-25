import { chromium } from '/home/linuxuser/Documents/GitHub/metabuilder/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(20000);

// Log in
await page.goto('http://localhost:8900/postgres/admin/login');
await page.fill('input[name="username"], input[type="text"], input[placeholder*="user" i]', 'admin');
await page.fill('input[name="password"], input[type="password"]', 'G38Rhim3FRCiFoetZMbVM4rnzvTyeAkS');
await page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")');
await page.waitForURL('**/dashboard**', { timeout: 10000 }).catch(() => {});

// Go to table manager
await page.goto('http://localhost:8900/postgres/admin/dashboard/table-manager');
await page.waitForTimeout(2000);
await page.screenshot({ path: '/tmp/table-manager.png', fullPage: true });
console.log('table-manager.png saved');

// Click Create Table button
const createBtn = page.locator('button:has-text("Create Table"), button:has-text("Create New"), button:has-text("New Table"), button:has-text("Create")').first();
const btnVisible = await createBtn.isVisible().catch(() => false);
console.log('Create button visible:', btnVisible);

if (btnVisible) {
  await createBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/create-table-dialog.png', fullPage: true });
  console.log('create-table-dialog.png saved');

  // Check for native selects
  const nativeSelects = await page.locator('[role="dialog"] select').count();
  console.log('Native <select> count in dialog:', nativeSelects);

  // Get column row bounding boxes to check horizontal layout
  const colRows = page.locator('[role="dialog"] select');
  const count = await colRows.count();
  for (let i = 0; i < count; i++) {
    const box = await colRows.nth(i).boundingBox();
    console.log(`Select ${i} box:`, JSON.stringify(box));
  }

  // Get parent box of first select to check flex layout
  const parentStyle = await page.locator('[role="dialog"] select').first().evaluate(el => {
    const p = el.parentElement;
    return p ? { tag: p.tagName, class: p.className, style: p.getAttribute('style') } : null;
  });
  console.log('Select parent:', JSON.stringify(parentStyle));
} else {
  const btns = await page.locator('button').allTextContents();
  console.log('All buttons on page:', btns.slice(0, 20));
}

await browser.close();
