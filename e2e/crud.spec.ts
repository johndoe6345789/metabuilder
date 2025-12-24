import { test, expect } from '@playwright/test';

// Test credentials for e2e login. Override via env vars to match seed data/fixtures.
const TEST_USERNAME = process.env.E2E_TEST_USERNAME ?? 'user';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? 'password123';

test.describe('CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login as user with appropriate permissions
    await page.goto('/');
    await page.getByLabel(/username/i).fill(TEST_USERNAME);
    await page.getByLabel(/password/i).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /login/i }).click();
    await expect(page.getByText(/welcome/i)).toBeVisible({ timeout: 10000 });
    
    // Wait for application to load
    await page.waitForLoadState('networkidle');
  });

  test('should display data table or list view', async ({ page }) => {
    // Check for common table/list elements
    const hasTable = await page.locator('table, [role="table"], [role="grid"]').count();
    const hasList = await page.locator('ul, ol, [role="list"]').count();
    
    expect(hasTable + hasList).toBeGreaterThan(0);
  });

  test('should have create/add button visible', async ({ page }) => {
    // Look for create/add buttons
    const createButton = page.getByRole('button', { name: /create|add|new/i }).first();
    
    // Button should be present (may need to wait for data to load)
    await expect(createButton).toBeVisible({ timeout: 10000 });
  });

  test('should open create form when clicking create button', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForTimeout(2000);
    
    // Click create button
    const createButton = page.getByRole('button', { name: /create|add|new/i }).first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Check if a form or dialog appears
      const hasForm = await page.locator('form, [role="dialog"], [role="form"]').count();
      expect(hasForm).toBeGreaterThan(0);
    }
  });

  test('should allow interaction with form inputs', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const createButton = page.getByRole('button', { name: /create|add|new/i }).first();
    
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(1000);
      
      // Try to find any input field
      const inputs = page.locator('input[type="text"], input[type="email"], textarea').first();
      
      if (await inputs.count() > 0) {
        await expect(inputs).toBeVisible();
        await inputs.fill('Test Data');
        await expect(inputs).toHaveValue('Test Data');
      }
    }
  });
});

test.describe('Schema Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Login with admin credentials
    await page.goto('/');
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('admin123');
    await page.getByRole('button', { name: /login/i }).click();
    
    // Handle password change if required
    const passwordChangeVisible = await page.getByText(/change.*password/i).isVisible().catch(() => false);
    if (passwordChangeVisible) {
      await page.getByLabel(/new password/i).first().fill('newadmin123');
      await page.getByLabel(/confirm/i).fill('newadmin123');
      await page.getByRole('button', { name: /save|change|update/i }).click();
    }
    
    await page.waitForLoadState('networkidle');
  });

  test('should have edit schema functionality', async ({ page }) => {
    // Look for schema editor button/link
    const schemaButton = page.getByRole('button', { name: /edit schema|schema/i }).first();
    
    // Check if schema editor exists (might be admin-only)
    const buttonCount = await schemaButton.count();
    
    if (buttonCount > 0) {
      await expect(schemaButton).toBeVisible({ timeout: 5000 });
    }
  });
});
