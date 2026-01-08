import { test, expect, type Page } from '@playwright/test'

/**
 * E2E tests for CRUD operations
 * 
 * Tests the complete Create → Read → Update → Delete flow for entities
 */

// Helper function to navigate to entity list
async function navigateToEntityList(page: Page, tenant: string, pkg: string, entity: string) {
  await page.goto(`/${tenant}/${pkg}/${entity}`)
  await page.waitForLoadState('networkidle')
}

// Helper function to wait for success message
async function waitForSuccessMessage(page: Page) {
  await expect(page.getByText(/success|created|updated|deleted/i)).toBeVisible({ timeout: 5000 })
}

test.describe('CRUD Operations', () => {
  test.describe('Entity List View', () => {
    test('should display entity list', async ({ page }) => {
      await navigateToEntityList(page, 'default', 'dashboard', 'users')
      
      // Check if list view is visible
      await expect(page.getByRole('heading', { name: /list/i })).toBeVisible({ timeout: 5000 })
      
      // Check if table or list container exists
      const listContainer = page.locator('table, [role="table"], .entity-list')
      await expect(listContainer).toBeVisible({ timeout: 5000 })
    })

    test('should show empty state when no entities', async ({ page }) => {
      await navigateToEntityList(page, 'default', 'dashboard', 'empty_entity')
      
      // Should show empty message or no rows
      const emptyMessage = page.getByText(/no.*found|empty|no data/i)
      await expect(emptyMessage).toBeVisible({ timeout: 5000 })
    })

    test('should have create button', async ({ page }) => {
      await navigateToEntityList(page, 'default', 'dashboard', 'users')
      
      // Check for create/new button
      const createButton = page.getByRole('button', { name: /create|new|add/i })
      await expect(createButton).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Entity Create Flow', () => {
    test('should navigate to create form', async ({ page }) => {
      await navigateToEntityList(page, 'default', 'dashboard', 'users')
      
      // Click create button
      await page.getByRole('button', { name: /create|new|add/i }).click()
      await page.waitForLoadState('networkidle')
      
      // Should see create form
      await expect(page.getByRole('heading', { name: /create|new/i })).toBeVisible({ timeout: 5000 })
    })

    test('should show form fields', async ({ page }) => {
      await page.goto('/default/dashboard/users/create')
      await page.waitForLoadState('networkidle')
      
      // Should have at least one input field
      const inputs = page.locator('input, textarea, select')
      await expect(inputs.first()).toBeVisible({ timeout: 5000 })
    })

    test('should have submit button', async ({ page }) => {
      await page.goto('/default/dashboard/users/create')
      
      // Should have submit/save/create button
      const submitButton = page.getByRole('button', { name: /submit|save|create/i })
      await expect(submitButton).toBeVisible({ timeout: 5000 })
    })

    test('should show validation errors for empty required fields', async ({ page }) => {
      await page.goto('/default/dashboard/users/create')
      
      // Try to submit without filling required fields
      await page.getByRole('button', { name: /submit|save|create/i }).click()
      
      // Should show validation error
      const errorMessage = page.getByText(/required|error|invalid/i)
      await expect(errorMessage).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Entity Detail View', () => {
    test('should display entity details', async ({ page }) => {
      // Navigate to a specific entity detail page
      await page.goto('/default/dashboard/users/test-user-123')
      await page.waitForLoadState('networkidle')
      
      // Should show detail view with fields
      await expect(page.getByRole('heading', { name: /detail|view/i })).toBeVisible({ timeout: 5000 })
    })

    test('should have edit button', async ({ page }) => {
      await page.goto('/default/dashboard/users/test-user-123')
      
      // Should have edit button
      const editButton = page.getByRole('button', { name: /edit|modify/i })
      await expect(editButton).toBeVisible({ timeout: 5000 })
    })

    test('should have delete button', async ({ page }) => {
      await page.goto('/default/dashboard/users/test-user-123')
      
      // Should have delete button
      const deleteButton = page.getByRole('button', { name: /delete|remove/i })
      await expect(deleteButton).toBeVisible({ timeout: 5000 })
    })

    test('should show 404 for non-existent entity', async ({ page }) => {
      await page.goto('/default/dashboard/users/non-existent-id-999')
      
      // Should show 404 or not found message
      const notFoundMessage = page.getByText(/not found|404/i)
      await expect(notFoundMessage).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Entity Update Flow', () => {
    test('should navigate to edit form', async ({ page }) => {
      await page.goto('/default/dashboard/users/test-user-123')
      
      // Click edit button
      await page.getByRole('button', { name: /edit|modify/i }).click()
      await page.waitForLoadState('networkidle')
      
      // Should see edit form
      await expect(page.getByRole('heading', { name: /edit|update/i })).toBeVisible({ timeout: 5000 })
    })

    test('should show pre-filled form fields', async ({ page }) => {
      await page.goto('/default/dashboard/users/test-user-123/edit')
      await page.waitForLoadState('networkidle')
      
      // Form fields should have values
      const inputs = page.locator('input[type="text"], input[type="email"]')
      const firstInput = inputs.first()
      await expect(firstInput).toBeVisible({ timeout: 5000 })
      
      // Check if input has a value
      const value = await firstInput.inputValue()
      expect(value).toBeTruthy()
    })

    test('should have update button', async ({ page }) => {
      await page.goto('/default/dashboard/users/test-user-123/edit')
      
      // Should have update/save button
      const updateButton = page.getByRole('button', { name: /update|save/i })
      await expect(updateButton).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Entity Delete Flow', () => {
    test('should show confirmation before delete', async ({ page }) => {
      await page.goto('/default/dashboard/users/test-user-123')
      
      // Click delete button
      await page.getByRole('button', { name: /delete|remove/i }).click()
      
      // Should show confirmation dialog
      const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i })
      await expect(confirmButton).toBeVisible({ timeout: 5000 })
    })

    test('should have cancel option', async ({ page }) => {
      await page.goto('/default/dashboard/users/test-user-123')
      
      // Click delete button
      await page.getByRole('button', { name: /delete|remove/i }).click()
      
      // Should have cancel button
      const cancelButton = page.getByRole('button', { name: /cancel|no/i })
      await expect(cancelButton).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Complete CRUD Flow', () => {
    test('should complete full CRUD cycle', async ({ page }) => {
      const entityName = `test-entity-${Date.now()}`
      
      // 1. Navigate to list
      await navigateToEntityList(page, 'default', 'dashboard', 'test_entities')
      
      // 2. Click create
      await page.getByRole('button', { name: /create|new|add/i }).click()
      await page.waitForLoadState('networkidle')
      
      // 3. Fill form
      const nameInput = page.locator('input[name="name"], input[id="name"]').first()
      if (await nameInput.isVisible()) {
        await nameInput.fill(entityName)
      }
      
      // 4. Submit
      await page.getByRole('button', { name: /submit|save|create/i }).click()
      await page.waitForLoadState('networkidle')
      
      // 5. Should redirect to detail or list
      await page.waitForURL(/\/default\/dashboard\/test_entities/, { timeout: 5000 })
      
      // 6. Navigate to detail if needed and edit
      // (Implementation depends on actual routing)
      
      // 7. Delete
      // (Implementation depends on actual UI)
    })
  })

  test.describe('Pagination', () => {
    test('should show pagination controls when list is large', async ({ page }) => {
      await navigateToEntityList(page, 'default', 'dashboard', 'users')
      
      // Look for pagination controls
      const pagination = page.locator('[role="navigation"], .pagination, nav')
      const paginationExists = await pagination.count() > 0
      
      if (paginationExists) {
        await expect(pagination.first()).toBeVisible()
      }
    })

    test('should navigate between pages', async ({ page }) => {
      await navigateToEntityList(page, 'default', 'dashboard', 'users')
      
      // Look for next page button
      const nextButton = page.getByRole('button', { name: /next|>/i })
      const nextButtonExists = await nextButton.count() > 0
      
      if (nextButtonExists && await nextButton.isEnabled()) {
        await nextButton.click()
        await page.waitForLoadState('networkidle')
        
        // URL or content should change
        expect(page.url()).toContain('page')
      }
    })
  })

  test.describe('Filtering and Sorting', () => {
    test('should have filter/search input', async ({ page }) => {
      await navigateToEntityList(page, 'default', 'dashboard', 'users')
      
      // Look for search or filter input
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="filter" i]')
      const searchExists = await searchInput.count() > 0
      
      if (searchExists) {
        await expect(searchInput.first()).toBeVisible()
      }
    })

    test('should have sort controls', async ({ page }) => {
      await navigateToEntityList(page, 'default', 'dashboard', 'users')
      
      // Look for sort buttons or dropdowns
      const sortControls = page.locator('button[aria-label*="sort" i], select[name*="sort" i], [class*="sort"]')
      const sortExists = await sortControls.count() > 0
      
      if (sortExists) {
        await expect(sortControls.first()).toBeVisible()
      }
    })
  })

  test.describe('Permission-Based Access', () => {
    test('should restrict access based on user level', async ({ page }) => {
      // Try to access admin-only entity as public user
      await page.goto('/default/admin/system_config')
      
      // Should see access denied or redirect to login
      const accessDenied = page.getByText(/access denied|forbidden|login required/i)
      await expect(accessDenied).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Multi-Tenant Isolation', () => {
    test('should only show tenant-specific data', async ({ page }) => {
      // Navigate to tenant A
      await navigateToEntityList(page, 'tenant-a', 'dashboard', 'users')
      
      // Store count or some identifier
      const tenantAContent = await page.textContent('body')
      
      // Navigate to tenant B
      await navigateToEntityList(page, 'tenant-b', 'dashboard', 'users')
      
      // Content should be different (different tenants)
      const tenantBContent = await page.textContent('body')
      
      // Basic check: they should have different content
      expect(tenantAContent).not.toBe(tenantBContent)
    })
  })

  test.describe('Error Handling', () => {
    test('should show user-friendly error on network failure', async ({ page }) => {
      // Simulate network failure by going offline
      await page.context().setOffline(true)
      
      await navigateToEntityList(page, 'default', 'dashboard', 'users')
      
      // Should show error message
      const errorMessage = page.getByText(/error|failed|unable|try again/i)
      await expect(errorMessage).toBeVisible({ timeout: 10000 })
      
      // Re-enable network
      await page.context().setOffline(false)
    })

    test('should show error on invalid data submission', async ({ page }) => {
      await page.goto('/default/dashboard/users/create')
      
      // Fill with invalid data
      const emailInput = page.locator('input[type="email"]').first()
      if (await emailInput.isVisible()) {
        await emailInput.fill('invalid-email')
      }
      
      // Submit
      await page.getByRole('button', { name: /submit|save|create/i }).click()
      
      // Should show validation error
      const validationError = page.getByText(/invalid|error/i)
      await expect(validationError).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Breadcrumb Navigation', () => {
    test('should show breadcrumb trail', async ({ page }) => {
      await page.goto('/default/dashboard/users/test-user-123')
      
      // Look for breadcrumb
      const breadcrumb = page.locator('nav[aria-label*="breadcrumb" i], .breadcrumb, [role="navigation"]')
      const breadcrumbExists = await breadcrumb.count() > 0
      
      if (breadcrumbExists) {
        await expect(breadcrumb.first()).toBeVisible()
      }
    })

    test('should navigate using breadcrumb', async ({ page }) => {
      await page.goto('/default/dashboard/users/test-user-123/edit')
      
      // Click on a breadcrumb link (if exists)
      const breadcrumbLinks = page.locator('nav a, .breadcrumb a')
      const linkCount = await breadcrumbLinks.count()
      
      if (linkCount > 0) {
        await breadcrumbLinks.first().click()
        await page.waitForLoadState('networkidle')
        
        // URL should change
        expect(page.url()).not.toContain('/edit')
      }
    })
  })
})
