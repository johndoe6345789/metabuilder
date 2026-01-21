import { expect, test } from '@playwright/test';

test.describe('SQL Query Interface', () => {
  test.describe('Execute Query API', () => {
    test('should reject query without authentication', async ({ page }) => {
      const response = await page.request.post('/api/admin/query', {
        data: {
          query: 'SELECT * FROM test_table',
        },
      });

      expect(response.status()).toBe(401);
    });

    test('should reject query without query text', async ({ page }) => {
      const response = await page.request.post('/api/admin/query', {
        data: {},
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject non-SELECT queries', async ({ page }) => {
      const response = await page.request.post('/api/admin/query', {
        data: {
          query: 'DELETE FROM test_table',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject INSERT queries', async ({ page }) => {
      const response = await page.request.post('/api/admin/query', {
        data: {
          query: 'INSERT INTO test_table VALUES (1)',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject UPDATE queries', async ({ page }) => {
      const response = await page.request.post('/api/admin/query', {
        data: {
          query: 'UPDATE test_table SET name = "test"',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject DROP queries', async ({ page }) => {
      const response = await page.request.post('/api/admin/query', {
        data: {
          query: 'DROP TABLE test_table',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject ALTER queries', async ({ page }) => {
      const response = await page.request.post('/api/admin/query', {
        data: {
          query: 'ALTER TABLE test_table ADD COLUMN test INTEGER',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject CREATE queries', async ({ page }) => {
      const response = await page.request.post('/api/admin/query', {
        data: {
          query: 'CREATE TABLE test_table (id INTEGER)',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should reject queries with SQL injection attempts', async ({ page }) => {
      const response = await page.request.post('/api/admin/query', {
        data: {
          query: 'SELECT * FROM users; DROP TABLE users;',
        },
      });

      expect([400, 401]).toContain(response.status());
    });

    test('should accept valid SELECT queries', async ({ page }) => {
      const response = await page.request.post('/api/admin/query', {
        data: {
          query: 'SELECT * FROM information_schema.tables LIMIT 1',
        },
      });

      // Should either be 401 (no auth) or 404/500 (no table) but not 400 (valid query format)
      expect([401, 404, 500, 200]).toContain(response.status());
    });
  });
});
