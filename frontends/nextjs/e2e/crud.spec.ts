import { expect, Page,test } from '@playwright/test';

// Helper function to navigate to login page
async function navigateToLogin(page: Page) {
  await page.goto('/');
  // Click "Sign In" button to navigate to login page
  await page.getByRole('button', { name: /sign in|get started/i }).first().click();
  // Wait for login form to appear
  await page.waitForLoadState('networkidle');
}

test.describe('Application Interface', () => {
  test('should have landing page with navigation options', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Check for navigation buttons
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();
  });

  test('should navigate to login when clicking sign in', async ({ page }) => {
    await page.goto('/');
    
    // Click sign in
    await page.getByRole('button', { name: /sign in|get started/i }).first().click();
    
    // Should see login form
    await expect(page.getByLabel(/username/i)).toBeVisible({ timeout: 5000 });
  });

  test('should have descriptive content on landing page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if landing page has meaningful content
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText!.length).toBeGreaterThan(100);
  });
});

test.describe('Login Interface', () => {
  test('should have username and password fields', async ({ page }) => {
    await navigateToLogin(page);
    
    // Check for form elements
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test('should have submit button', async ({ page }) => {
    await navigateToLogin(page);
    
    // Check for login button
    await expect(page.getByRole('button', { name: /login|sign in/i })).toBeVisible();
  });
});
