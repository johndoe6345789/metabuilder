import { expect, test } from '@playwright/test';

test.describe('Login: show-password eye toggle', () => {
  test('toggles password input type and button label', async ({ page }) => {
    await page.goto('/postgres/admin/login');

    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('admin123');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    const showBtn = page.getByRole('button', { name: /show password/i });
    await expect(showBtn).toBeVisible();
    await showBtn.click();

    await expect(passwordInput).toHaveAttribute('type', 'text');
    await expect(passwordInput).toHaveValue('admin123');

    const hideBtn = page.getByRole('button', { name: /hide password/i });
    await expect(hideBtn).toBeVisible();
    await hideBtn.click();

    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
