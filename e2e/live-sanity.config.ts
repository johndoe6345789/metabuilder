import { defineConfig, devices } from '@playwright/test';
export default defineConfig({ testDir:'.', testMatch:'live-sanity.spec.ts', timeout:60000,
  use:{ viewport:{width:1440,height:900}, ignoreHTTPSErrors:true },
  projects:[{name:'chromium',use:{...devices['Desktop Chrome']}}] });
