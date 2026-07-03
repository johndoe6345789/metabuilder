import { test, expect } from '@playwright/test';

/**
 * Bucket management tests for the S3 server.
 * Validates create dialog and bucket detail view.
 */
test.describe('S3 Bucket Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/buckets', {
      waitUntil: 'domcontentloaded',
    });
  });

  test('create bucket button exists', async ({
    page,
  }) => {
    const btn = page.getByTestId(
      'create-bucket-button',
    );
    await expect(btn).toBeVisible();
  });

  test('create bucket dialog opens', async ({
    page,
  }) => {
    const btn = page.getByTestId(
      'create-bucket-button',
    );
    await btn.click();
    const dialog = page.getByTestId(
      'create-bucket-dialog',
    );
    await expect(dialog).toBeVisible();
  });

  test('create dialog has name input', async ({
    page,
  }) => {
    const btn = page.getByTestId(
      'create-bucket-button',
    );
    await btn.click();
    const input = page.getByTestId(
      'bucket-name-input',
    );
    await expect(input).toBeVisible();
    await expect(input).toBeEditable();
  });

  test('create dialog has confirm button', async ({
    page,
  }) => {
    const btn = page.getByTestId(
      'create-bucket-button',
    );
    await btn.click();
    const confirm = page.getByTestId(
      'confirm-create-bucket',
    );
    await expect(confirm).toBeVisible();
  });

  test('bucket detail view loads', async ({
    page,
  }) => {
    const response = await page.goto(
      '/buckets/test-bucket',
      {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      },
    );
    expect(response?.status()).toBeLessThan(500);
  });

  test('bucket detail shows object list', async ({
    page,
  }) => {
    await page.goto('/buckets/test-bucket', {
      waitUntil: 'domcontentloaded',
    });
    const list = page.getByTestId('object-list');
    await expect(list).toBeVisible();
  });
});
