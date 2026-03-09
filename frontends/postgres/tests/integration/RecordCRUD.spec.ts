import { expect, test } from '@playwright/test';

test.describe('Record CRUD Operations', () => {
  test.describe('Create Record API', () => {
    test('should reject create record without authentication', async ({ page }) => {
      const response = await page.request.post('/api/admin/record', {
        data: {
          tableName: 'test_table',
          data: { name: 'Test', value: 123 },
        },
      });

      expect(response.status()).toBe(401);
    });

    test('should reject create record without table name', async ({ page }) => {
      const response = await page.request.post('/api/admin/record', {
        data: {
          data: { name: 'Test' },
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject create record with invalid table name', async ({ page }) => {
      const response = await page.request.post('/api/admin/record', {
        data: {
          tableName: 'invalid-table!@#',
          data: { name: 'Test' },
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject create record without data', async ({ page }) => {
      const response = await page.request.post('/api/admin/record', {
        data: {
          tableName: 'test_table',
        },
      });

      expect([400, 401]).toContain(response.status());
    });
  });

  test.describe('Update Record API', () => {
    test('should reject update record without authentication', async ({ page }) => {
      const response = await page.request.put('/api/admin/record', {
        data: {
          tableName: 'test_table',
          primaryKey: 'id',
          primaryValue: 1,
          data: { name: 'Updated' },
        },
      });

      expect(response.status()).toBe(401);
    });

    test('should reject update record without required fields', async ({ page }) => {
      const response = await page.request.put('/api/admin/record', {
        data: {
          tableName: 'test_table',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject update record with invalid table name', async ({ page }) => {
      const response = await page.request.put('/api/admin/record', {
        data: {
          tableName: 'invalid!@#',
          primaryKey: 'id',
          primaryValue: 1,
          data: { name: 'Updated' },
        },
      });

      expect([400, 401]).toContain(response.status());
    });
  });

  test.describe('Delete Record API', () => {
    test('should reject delete record without authentication', async ({ page }) => {
      const response = await page.request.delete('/api/admin/record', {
        data: {
          tableName: 'test_table',
          primaryKey: 'id',
          primaryValue: 1,
        },
      });

      expect(response.status()).toBe(401);
    });

    test('should reject delete record without required fields', async ({ page }) => {
      const response = await page.request.delete('/api/admin/record', {
        data: {
          tableName: 'test_table',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject delete record with invalid table name', async ({ page }) => {
      const response = await page.request.delete('/api/admin/record', {
        data: {
          tableName: 'invalid!@#',
          primaryKey: 'id',
          primaryValue: 1,
        },
      });

      expect([400, 401]).toContain(response.status());
    });
  });
});
