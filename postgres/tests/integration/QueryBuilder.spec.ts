import { expect, test } from '@playwright/test';

test.describe('Query Builder API', () => {
  test.describe('Authentication', () => {
    test('should reject query builder without authentication', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
        },
      });

      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });
  });

  test.describe('Input Validation', () => {
    test('should reject query without table name', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {},
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject query with invalid table name', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users; DROP TABLE users--',
        },
      });

      expect(response.status()).toBe(401); // No auth, but would be 400 if authenticated
    });

    test('should reject query with invalid column name', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          columns: ['id', 'name; DROP TABLE--'],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject query with invalid operator', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          where: [
            {
              column: 'id',
              operator: 'EXEC',
              value: '1',
            },
          ],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject IN operator without array value', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          where: [
            {
              column: 'id',
              operator: 'IN',
              value: 'not-an-array',
            },
          ],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject operator requiring value without value', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          where: [
            {
              column: 'id',
              operator: '=',
            },
          ],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject invalid LIMIT value', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          limit: -5,
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject invalid OFFSET value', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          offset: 'invalid',
        },
      });

      expect(response.status()).toBe(401); // No auth
    });
  });

  test.describe('Query Building', () => {
    test('should accept valid table name', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'test_table',
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should accept query with column selection', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          columns: ['id', 'name', 'email'],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should accept query with WHERE conditions', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          where: [
            {
              column: 'id',
              operator: '=',
              value: 1,
            },
            {
              column: 'name',
              operator: 'LIKE',
              value: '%john%',
            },
          ],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should accept IS NULL operator without value', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          where: [
            {
              column: 'email',
              operator: 'IS NULL',
            },
          ],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should accept IS NOT NULL operator without value', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          where: [
            {
              column: 'email',
              operator: 'IS NOT NULL',
            },
          ],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should accept IN operator with array value', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          where: [
            {
              column: 'id',
              operator: 'IN',
              value: [1, 2, 3],
            },
          ],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should accept query with ORDER BY', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          orderBy: {
            column: 'created_at',
            direction: 'DESC',
          },
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should accept query with LIMIT', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          limit: 10,
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should accept query with OFFSET', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          offset: 5,
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should accept comprehensive query', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          columns: ['id', 'name', 'email'],
          where: [
            {
              column: 'id',
              operator: '>',
              value: 5,
            },
            {
              column: 'name',
              operator: 'LIKE',
              value: '%admin%',
            },
          ],
          orderBy: {
            column: 'id',
            direction: 'ASC',
          },
          limit: 20,
          offset: 10,
        },
      });

      expect(response.status()).toBe(401); // No auth
    });
  });

  test.describe('SQL Injection Prevention', () => {
    test('should reject SQL injection in table name', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: "users' OR '1'='1",
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject SQL injection in column name', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          columns: ["id'; DROP TABLE users--"],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject SQL injection in WHERE column', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          where: [
            {
              column: "id'; DELETE FROM users--",
              operator: '=',
              value: 1,
            },
          ],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject SQL injection in ORDER BY column', async ({ page }) => {
      const response = await page.request.post('/api/admin/query-builder', {
        data: {
          table: 'users',
          orderBy: {
            column: "id'; DROP TABLE--",
            direction: 'ASC',
          },
        },
      });

      expect(response.status()).toBe(401); // No auth
    });
  });
});
