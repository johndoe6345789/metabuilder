import { chromium } from '/home/linuxuser/Documents/GitHub/metabuilder/node_modules/playwright/index.mjs';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
page.setDefaultTimeout(20000);

await page.goto('http://localhost:8900/postgres/admin/login');
await page.fill('input[name="username"], input[type="text"]', 'admin');
await page.fill('input[type="password"]', 'G38Rhim3FRCiFoetZMbVM4rnzvTyeAkS');
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard**', { timeout: 10000 }).catch(() => {});

// --- Schema page ---
await page.goto('http://localhost:8900/postgres/admin/dashboard/table-manager');
await page.waitForTimeout(1500);
console.log('Page title (Schema):', await page.title());

// Open Drop Table dialog — verify confirmation step
await page.click('button:has-text("Drop Table")');
await page.waitForTimeout(800);
await page.screenshot({ path: '/tmp/drop-dialog.png' });
// Select a table
const dropSelect = page.locator('[role="dialog"] select');
await dropSelect.selectOption({ index: 1 });
await page.waitForTimeout(400);
await page.screenshot({ path: '/tmp/drop-dialog-selected.png' });
console.log('Drop dialog screenshots saved');
await page.keyboard.press('Escape');

// --- Constraints page ---
await page.goto('http://localhost:8900/postgres/admin/dashboard/constraints');
await page.waitForTimeout(1500);
console.log('Page title (Constraints):', await page.title());
await page.screenshot({ path: '/tmp/constraints-page.png' });

// Select table via native select
const conSelect = page.locator('select').first();
if (await conSelect.isVisible().catch(() => false)) {
  await conSelect.selectOption({ label: 'User' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/constraints-user.png' });
  console.log('Constraints with User table saved');

  // Click Add Constraint
  const addBtn = page.locator('button:has-text("Add Constraint")');
  if (await addBtn.isVisible().catch(() => false)) {
    await addBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: '/tmp/constraints-add-dialog.png' });
    console.log('Add Constraint dialog saved');
    await page.keyboard.press('Escape');
  }
}

// --- Indexes page ---
await page.goto('http://localhost:8900/postgres/admin/dashboard/indexes');
await page.waitForTimeout(1500);
console.log('Page title (Indexes):', await page.title());
await page.screenshot({ path: '/tmp/indexes-page.png' });
const idxSelect = page.locator('select').first();
if (await idxSelect.isVisible().catch(() => false)) {
  await idxSelect.selectOption({ label: 'User' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/indexes-user.png' });
  console.log('Indexes with User table saved');
}

// --- SQL Query page ---
await page.goto('http://localhost:8900/postgres/admin/dashboard/query');
await page.waitForTimeout(1200);
console.log('Page title (SQL):', await page.title());
await page.screenshot({ path: '/tmp/sql-page.png' });
const hintVisible = await page.locator('text=Type a query above').isVisible().catch(() => false);
console.log('Execute Query hint visible:', hintVisible);

// --- Query Builder page ---
await page.goto('http://localhost:8900/postgres/admin/dashboard/query-builder');
await page.waitForTimeout(1200);
console.log('Page title (Query Builder):', await page.title());
await page.screenshot({ path: '/tmp/query-builder.png' });
// Select a table to show column checkboxes
const qbSelect = page.locator('select').first();
if (await qbSelect.isVisible().catch(() => false)) {
  await qbSelect.selectOption({ index: 1 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/tmp/query-builder-columns.png' });
  console.log('Query Builder with columns saved');
}

await browser.close();
console.log('Done');
