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

  test('should display MetaBuilder landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page has loaded
    await page.waitForLoadState('domcontentloaded');
    
    // Check if navigation buttons are present (more reliable than text search)
    await expect(page.getByRole('button', { name: /sign in|get started/i })).toBeVisible();
  });

  test('should not have critical console errors on load', async ({ page }) => {
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
      !err.includes('Chrome extension') &&
      !err.includes('Failed to load resource') && // Network errors are not critical for UI testing
      !err.includes('403') &&
      !err.includes('ERR_NAME_NOT_RESOLVED')
    );
    
    // Should have no critical console errors (application logic errors)
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
