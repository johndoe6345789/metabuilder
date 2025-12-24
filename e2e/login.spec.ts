import { test, expect } from '@playwright/test';

test.describe('Login functionality', () => {
  test('should display login form on initial load', async ({ page }) => {
    await page.goto('/');
    
    // Check if login form is visible
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/');
    
    // Try to login with invalid credentials
    await page.getByLabel(/username/i).fill('invaliduser');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /login/i }).click();
    
    // Check for error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/');
    
    // Login with default credentials (adjust based on seed data)
    await page.getByLabel(/username/i).fill('user');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login/i }).click();
    
    // Check if login was successful - look for welcome message or navigation
    await expect(page.getByText(/welcome/i)).toBeVisible({ timeout: 10000 });
  });

  test('should require password change on first login', async ({ page }) => {
    await page.goto('/');
    
    // Login with a user that needs password change (adjust credentials as needed)
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /login/i }).click();
    
    // Check if password change dialog appears
    await expect(page.getByText(/change.*password/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each navigation test
    await page.goto('/');
    await page.getByLabel(/username/i).fill('user');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page.getByText(/welcome/i)).toBeVisible({ timeout: 10000 });
  });

  test('should display main application interface after login', async ({ page }) => {
    // Check if main interface elements are visible
    await expect(page).toHaveTitle(/metabuilder|admin|spark/i, { timeout: 10000 });
  });

  test('should allow navigation between different sections', async ({ page }) => {
    // Wait for the page to load after login
    await page.waitForLoadState('networkidle');
    
    // Check if any navigation elements are present
    const hasNavigation = await page.locator('nav, [role="navigation"], aside').count();
    expect(hasNavigation).toBeGreaterThan(0);
  });
});
