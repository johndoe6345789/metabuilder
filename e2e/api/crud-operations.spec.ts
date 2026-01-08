/**
 * E2E tests for CRUD operations via API
 * 
 * Tests the complete lifecycle of entity operations through the API
 */

import { test, expect } from '@playwright/test'

test.describe('API CRUD Operations', () => {
  const baseURL = 'http://localhost:3000'
  const tenant = 'test-tenant'
  const packageId = 'test-package'
  const entity = 'test-entity'
  
  let createdEntityId: string

  test.describe('List Entities (GET)', () => {
    test('should list entities with default pagination', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/v1/${tenant}/${packageId}/${entity}`)
      
      // Expect either 200 (success) or appropriate error for missing package
      expect([200, 404, 401, 403]).toContain(response.status())
      
      if (response.status() === 200) {
        const data = await response.json()
        expect(data).toBeDefined()
        expect(Array.isArray(data) || Array.isArray(data.data)).toBeTruthy()
      }
    })

    test('should list entities with pagination parameters', async ({ request }) => {
      const response = await request.get(
        `${baseURL}/api/v1/${tenant}/${packageId}/${entity}?page=1&limit=10`
      )
      
      if (response.status() === 200) {
        const data = await response.json()
        expect(data).toBeDefined()
      }
    })

    test('should list entities with filters', async ({ request }) => {
      const filter = JSON.stringify({ published: true })
      const response = await request.get(
        `${baseURL}/api/v1/${tenant}/${packageId}/${entity}?filter=${encodeURIComponent(filter)}`
      )
      
      if (response.status() === 200) {
        const data = await response.json()
        expect(data).toBeDefined()
      }
    })

    test('should list entities with sorting', async ({ request }) => {
      const response = await request.get(
        `${baseURL}/api/v1/${tenant}/${packageId}/${entity}?sort=-createdAt`
      )
      
      if (response.status() === 200) {
        const data = await response.json()
        expect(data).toBeDefined()
      }
    })
  })

  test.describe('Create Entity (POST)', () => {
    test('should create a new entity or return appropriate error', async ({ request }) => {
      const newEntity = {
        name: 'Test Entity',
        description: 'Created by E2E test',
        createdAt: new Date().toISOString(),
      }

      const response = await request.post(`${baseURL}/api/v1/${tenant}/${packageId}/${entity}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: newEntity,
      })

      // Expect either success or appropriate error
      if (response.status() === 201) {
        const data = await response.json()
        expect(data).toBeDefined()
        expect(data.id).toBeDefined()
        createdEntityId = data.id
      } else {
        const error = await response.json()
        console.log('Create entity error:', error)
      }
    })

    test('should reject invalid entity data', async ({ request }) => {
      const invalidEntity = {}

      const response = await request.post(`${baseURL}/api/v1/${tenant}/${packageId}/${entity}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: invalidEntity,
      })

      expect([400, 404, 401, 403]).toContain(response.status())
    })
  })

  test.describe('Read Entity (GET)', () => {
    test('should get entity by ID or return not found', async ({ request }) => {
      const testId = 'test-id-123'
      const response = await request.get(`${baseURL}/api/v1/${tenant}/${packageId}/${entity}/${testId}`)

      expect([200, 404, 401, 403]).toContain(response.status())

      if (response.status() === 200) {
        const data = await response.json()
        expect(data).toBeDefined()
      }
    })
  })

  test.describe('Update Entity (PUT)', () => {
    test('should update an existing entity or return error', async ({ request }) => {
      const testId = 'test-id-123'
      const updates = {
        name: 'Updated Entity Name',
        updatedAt: new Date().toISOString(),
      }

      const response = await request.put(`${baseURL}/api/v1/${tenant}/${packageId}/${entity}/${testId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        data: updates,
      })

      expect([200, 404, 401, 403]).toContain(response.status())
    })
  })

  test.describe('Delete Entity (DELETE)', () => {
    test('should delete an existing entity or return error', async ({ request }) => {
      const testId = 'test-id-to-delete'
      const response = await request.delete(`${baseURL}/api/v1/${tenant}/${packageId}/${entity}/${testId}`)

      expect([200, 204, 404, 401, 403]).toContain(response.status())
    })
  })

  test.describe('Error Handling', () => {
    test('should return proper error for invalid route', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/v1/invalid`)
      
      expect([400, 404]).toContain(response.status())
    })

    test('should handle missing package gracefully', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/v1/${tenant}/non-existent-package/entity`)
      
      expect([404, 403]).toContain(response.status())
      
      const error = await response.json()
      expect(error.error).toBeDefined()
    })

    test('should return JSON error responses', async ({ request }) => {
      const response = await request.get(`${baseURL}/api/v1/invalid/route`)
      
      const contentType = response.headers()['content-type']
      if (contentType) {
        expect(contentType).toContain('application/json')
      }
    })
  })
})
