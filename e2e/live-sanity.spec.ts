import { test } from '@playwright/test';
const U=process.env.PG_ADMIN_USER??'admin', P=process.env.PG_ADMIN_PASS??'';
const BASE='https://metabuilder.wardcrew.com/postgres/admin';
test('live sanity', async ({ page }) => {
  const errs:string[]=[]; page.on('pageerror',e=>errs.push(e.message));
  await page.goto(`${BASE}/login`,{waitUntil:'networkidle',timeout:15000});
  await page.fill('input[name="username"], input[type="text"]',U);
  await page.fill('input[name="password"], input[type="password"]',P);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard/**',{timeout:10000});
  await page.goto(`${BASE}/dashboard/tables`,{waitUntil:'networkidle',timeout:30000});
  await page.waitForTimeout(700);
  const r = await page.evaluate(()=>{
    const bar=document.querySelector('.app-bar') as HTMLElement;
    const menuBtns=document.querySelectorAll('.app-bar button[aria-label*="navigation"]').length;
    // count icon-only buttons that look like burgers in the bar
    const storageIcons=document.querySelectorAll('.app-bar [class*="barIcon"]').length;
    return {
      appBarPos: bar?getComputedStyle(bar).position:'none',
      appBarH: bar?Math.round(bar.getBoundingClientRect().height):0,
      menuButtons: menuBtns,
      storageLogo: storageIcons,
    };
  });
  console.log('app-bar position:', r.appBarPos, '(expect fixed)');
  console.log('app-bar height:', r.appBarH, '(expect ~64)');
  console.log('menu buttons:', r.menuButtons, '| storage logo (double burger):', r.storageLogo, '(expect 1 menu, 0 storage)');
  console.log('page errors:', errs.length?errs.join('|'):'none');
});
