import { test, expect } from '@playwright/test';

// Helper function to navigate to login page
async function navigateToLogin(page: any) {
  await page.goto('/');
  // Click "Sign In" button to navigate to login page
  await page.getByRole('button', { name: /sign in|get started/i }).first().click();
  // Wait for login form to appear
  await page.waitForLoadState('networkidle');
}

test.describe('Login functionality', () => {
  test('should display login form after navigating from landing page', async ({ page }) => {
    await navigateToLogin(page);
    
    // Check if login form is visible
    await expect(page.getByLabel(/username/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login|sign in/i })).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await navigateToLogin(page);
    
    // Try to login with invalid credentials
    await page.getByLabel(/username/i).fill('invaliduser');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    
    // Check for error message or notification
    await expect(page.getByText(/invalid|error/i)).toBeVisible({ timeout: 5000 });
  });

  test('should have register/sign up option', async ({ page }) => {
    await navigateToLogin(page);
    
    // Check if there's a register or sign up option available
    const hasRegister = await page.getByText(/register|sign up|create account/i).count();
    expect(hasRegister).toBeGreaterThan(0);
  });

  test('should have back button to return to landing', async ({ page }) => {
    await navigateToLogin(page);
    
    // Check if there's a back or return button
    const backButton = page.getByRole('button', { name: /back|return/i }).first();
    await expect(backButton).toBeVisible({ timeout: 5000 });
  });
});
