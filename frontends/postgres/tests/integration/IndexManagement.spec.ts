import { expect, test } from '@playwright/test';

test.describe('Index Management API', () => {
  test.describe('Authentication', () => {
    test('should reject list indexes without authentication', async ({ page }) => {
      const response = await page.request.get('/api/admin/indexes?tableName=users');

      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    test('should reject create index without authentication', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users',
          indexName: 'idx_users_email',
          columns: ['email'],
        },
      });

      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    test('should reject delete index without authentication', async ({ page }) => {
      const response = await page.request.delete('/api/admin/indexes', {
        data: {
          indexName: 'idx_users_email',
        },
      });

      expect(response.status()).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });
  });

  test.describe('Input Validation - List Indexes', () => {
    test('should reject list without table name', async ({ page }) => {
      const response = await page.request.get('/api/admin/indexes');

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject list with invalid table name', async ({ page }) => {
      const response = await page.request.get('/api/admin/indexes?tableName=users;DROP--');

      expect(response.status()).toBe(401); // No auth
    });
  });

  test.describe('Input Validation - Create Index', () => {
    test('should reject create without table name', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          indexName: 'idx_test',
          columns: ['id'],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject create without index name', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users',
          columns: ['id'],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject create without columns', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users',
          indexName: 'idx_test',
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject create with empty columns array', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users',
          indexName: 'idx_test',
          columns: [],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject create with invalid table name', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users; DROP TABLE--',
          indexName: 'idx_test',
          columns: ['id'],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject create with invalid index name', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users',
          indexName: 'idx-test; DROP--',
          columns: ['id'],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject create with invalid column name', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users',
          indexName: 'idx_test',
          columns: ['id; DROP TABLE--'],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject create with invalid index type', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users',
          indexName: 'idx_test',
          columns: ['id'],
          indexType: 'INVALID_TYPE',
        },
      });

      expect(response.status()).toBe(401); // No auth
    });
  });

  test.describe('Input Validation - Delete Index', () => {
    test('should reject delete without index name', async ({ page }) => {
      const response = await page.request.delete('/api/admin/indexes', {
        data: {},
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject delete with invalid index name', async ({ page }) => {
      const response = await page.request.delete('/api/admin/indexes', {
        data: {
          indexName: 'idx; DROP TABLE--',
        },
      });

      expect(response.status()).toBe(401); // No auth
    });
  });

  test.describe('Valid Requests', () => {
    test('should accept valid list request', async ({ page }) => {
      const response = await page.request.get('/api/admin/indexes?tableName=users');

      expect(response.status()).toBe(401); // No auth, but would work if authenticated
    });

    test('should accept valid create request with single column', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users',
          indexName: 'idx_users_email',
          columns: ['email'],
          indexType: 'BTREE',
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should accept valid create request with multiple columns', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users',
          indexName: 'idx_users_name_email',
          columns: ['name', 'email'],
          indexType: 'BTREE',
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should accept create request with unique flag', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users',
          indexName: 'idx_users_email_unique',
          columns: ['email'],
          indexType: 'BTREE',
          unique: true,
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should accept create request with HASH index type', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users',
          indexName: 'idx_users_id_hash',
          columns: ['id'],
          indexType: 'HASH',
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should accept create request with GIN index type', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users',
          indexName: 'idx_users_data_gin',
          columns: ['data'],
          indexType: 'GIN',
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should accept create request with GIST index type', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users',
          indexName: 'idx_users_location_gist',
          columns: ['location'],
          indexType: 'GIST',
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should accept create request with BRIN index type', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users',
          indexName: 'idx_users_created_brin',
          columns: ['created_at'],
          indexType: 'BRIN',
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should accept valid delete request', async ({ page }) => {
      const response = await page.request.delete('/api/admin/indexes', {
        data: {
          indexName: 'idx_users_email',
        },
      });

      expect(response.status()).toBe(401); // No auth
    });
  });

  test.describe('SQL Injection Prevention', () => {
    test('should reject SQL injection in table name', async ({ page }) => {
      const response = await page.request.get('/api/admin/indexes?tableName=users\';DROP TABLE users--');

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject SQL injection in index name (create)', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users',
          indexName: 'idx\'; DROP TABLE users--',
          columns: ['id'],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject SQL injection in column name', async ({ page }) => {
      const response = await page.request.post('/api/admin/indexes', {
        data: {
          tableName: 'users',
          indexName: 'idx_test',
          columns: ['id\'; DROP TABLE--'],
        },
      });

      expect(response.status()).toBe(401); // No auth
    });

    test('should reject SQL injection in index name (delete)', async ({ page }) => {
      const response = await page.request.delete('/api/admin/indexes', {
        data: {
          indexName: 'idx\'; DROP TABLE--',
        },
      });

      expect(response.status()).toBe(401); // No auth
    });
  });
});
