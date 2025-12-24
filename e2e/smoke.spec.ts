import { test, expect } from '@playwright/test';

test.describe('Basic Smoke Tests', () => {
  test('should load the application', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Check if page loads without critical errors
    await page.waitForLoadState('domcontentloaded');
    
    // Verify the page has loaded some content
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(0);
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    
    // Check if title is set
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should not have console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('Chrome extension')
    );
    
    // Should have no critical console errors
    expect(
      criticalErrors,
      `Console errors found: ${criticalErrors.join('\n')}`
    ).toEqual([]);
  });

  test('should have viewport properly configured', async ({ page }) => {
    await page.goto('/');
    
    const viewport = page.viewportSize();
    expect(viewport).toBeTruthy();
    expect(viewport!.width).toBeGreaterThan(0);
    expect(viewport!.height).toBeGreaterThan(0);
  });
});
