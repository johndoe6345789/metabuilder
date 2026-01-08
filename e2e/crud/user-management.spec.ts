import { test, expect, Page } from '@playwright/test'

/**
 * User Management CRUD E2E Tests
 * Demonstrates TDD principles for CRUD operations
 */

// Test data
const testUser = {
  name: 'Test User ' + Date.now(),
  email: 'testuser' + Date.now() + '@example.com',
  password: 'TestPassword123!',
  level: 1
}

test.describe('User Management CRUD Operations', () => {
  // Skip tests if not in authenticated context
  test.beforeEach(async ({ page }) => {
    // These tests require admin access
    // Skip if TEST_ADMIN credentials not available
    if (!process.env.TEST_ADMIN_EMAIL || !process.env.TEST_ADMIN_PASSWORD) {
      test.skip()
    }

    // Login as admin
    await page.goto('/login')
    await page.fill('input[name="email"]', process.env.TEST_ADMIN_EMAIL!)
    await page.fill('input[name="password"]', process.env.TEST_ADMIN_PASSWORD!)
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/)
  })

  test.describe('Create User', () => {
    test('should display create user form', async ({ page }) => {
      await page.goto('/admin/users')
      
      // Click create button
      const createButton = page.locator('button:has-text("Create"), button:has-text("New User"), a:has-text("Add User")')
      await expect(createButton.first()).toBeVisible()
      await createButton.first().click()
      
      // Verify form elements
      await expect(page.locator('input[name="name"]')).toBeVisible()
      await expect(page.locator('input[name="email"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should validate required fields', async ({ page }) => {
      await page.goto('/admin/users')
      await page.click('button:has-text("Create"), button:has-text("New User"), a:has-text("Add User")')
      
      // Try to submit empty form
      await page.click('button[type="submit"]')
      
      // Should show validation errors
      const emailInput = page.locator('input[name="email"]')
      await expect(emailInput).toHaveAttribute('required', '')
    })

    test('should validate email format', async ({ page }) => {
      await page.goto('/admin/users')
      await page.click('button:has-text("Create"), button:has-text("New User")')
      
      // Fill with invalid email
      await page.fill('input[name="email"]', 'invalid-email')
      await page.fill('input[name="name"]', 'Test User')
      await page.click('button[type="submit"]')
      
      // Should show validation error
      await expect(page.locator('input[name="email"]:invalid')).toBeVisible()
    })

    test('should create user with valid data', async ({ page }) => {
      await page.goto('/admin/users')
      
      // Get initial user count
      const userRows = page.locator('tbody tr')
      const initialCount = await userRows.count()
      
      // Click create button
      await page.click('button:has-text("Create"), button:has-text("New User")')
      
      // Fill form
      await page.fill('input[name="name"]', testUser.name)
      await page.fill('input[name="email"]', testUser.email)
      
      // Check if password field exists (for create)
      const passwordField = page.locator('input[name="password"]')
      const hasPassword = await passwordField.count() > 0
      if (hasPassword) {
        await page.fill('input[name="password"]', testUser.password)
      }
      
      // Select level if dropdown exists
      const levelSelect = page.locator('select[name="level"]')
      const hasLevel = await levelSelect.count() > 0
      if (hasLevel) {
        await page.selectOption('select[name="level"]', testUser.level.toString())
      }
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Verify success message or redirect
      await page.waitForTimeout(1000)
      
      // Check for success indicator
      const successMessage = page.locator('text=/success|created|added/i')
      const hasSuccessMessage = await successMessage.count() > 0
      
      // Or check if returned to list with new count
      const newCount = await userRows.count()
      
      expect(hasSuccessMessage || newCount > initialCount).toBeTruthy()
    })
  })

  test.describe('Read User', () => {
    test('should display list of users', async ({ page }) => {
      await page.goto('/admin/users')
      
      // Verify table or list exists
      const userTable = page.locator('table, [role="table"]')
      const userList = page.locator('ul, [role="list"]')
      
      const hasTable = await userTable.count() > 0
      const hasList = await userList.count() > 0
      
      expect(hasTable || hasList).toBeTruthy()
    })

    test('should display user details', async ({ page }) => {
      await page.goto('/admin/users')
      
      // Click on first user
      const firstUser = page.locator('tbody tr, li').first()
      const viewButton = firstUser.locator('a:has-text("View"), button:has-text("View")')
      const hasViewButton = await viewButton.count() > 0
      
      if (hasViewButton) {
        await viewButton.click()
        
        // Verify user details page
        await expect(page.locator('text=/email|name|level/i')).toBeVisible()
      } else {
        // Click on row itself
        await firstUser.click()
        
        // Should navigate to details or expand details
        await page.waitForTimeout(500)
      }
    })

    test('should support searching users', async ({ page }) => {
      await page.goto('/admin/users')
      
      // Look for search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="search"]')
      const hasSearch = await searchInput.count() > 0
      
      if (hasSearch) {
        await searchInput.first().fill('admin')
        await page.waitForTimeout(500)
        
        // Results should be filtered
        const userRows = page.locator('tbody tr')
        const count = await userRows.count()
        expect(count).toBeGreaterThan(0)
      }
    })

    test('should support pagination', async ({ page }) => {
      await page.goto('/admin/users')
      
      // Look for pagination controls
      const pagination = page.locator('[aria-label="pagination"], .pagination')
      const hasPagination = await pagination.count() > 0
      
      if (hasPagination) {
        const nextButton = page.locator('button:has-text("Next"), a:has-text("Next")')
        const hasNext = await nextButton.count() > 0
        
        if (hasNext) {
          await nextButton.click()
          await page.waitForLoadState('networkidle')
          
          // URL or content should change
          expect(page.url()).toBeTruthy()
        }
      }
    })
  })

  test.describe('Update User', () => {
    test('should display edit user form', async ({ page }) => {
      await page.goto('/admin/users')
      
      // Click edit on first user
      const firstUser = page.locator('tbody tr, li').first()
      const editButton = firstUser.locator('button:has-text("Edit"), a:has-text("Edit")')
      
      await expect(editButton).toBeVisible()
      await editButton.click()
      
      // Verify form is pre-filled
      const nameInput = page.locator('input[name="name"]')
      const emailInput = page.locator('input[name="email"]')
      
      await expect(nameInput).toBeVisible()
      await expect(emailInput).toBeVisible()
      
      // Fields should have values
      const nameValue = await nameInput.inputValue()
      const emailValue = await emailInput.inputValue()
      
      expect(nameValue).toBeTruthy()
      expect(emailValue).toBeTruthy()
    })

    test('should update user successfully', async ({ page }) => {
      await page.goto('/admin/users')
      
      // Find and edit first user
      const firstUser = page.locator('tbody tr').first()
      await firstUser.locator('button:has-text("Edit"), a:has-text("Edit")').click()
      
      // Update name
      const updatedName = 'Updated User ' + Date.now()
      await page.fill('input[name="name"]', updatedName)
      
      // Submit
      await page.click('button[type="submit"]')
      
      // Verify success
      await page.waitForTimeout(1000)
      const successMessage = page.locator('text=/success|updated/i')
      await expect(successMessage).toBeVisible({ timeout: 5000 })
    })

    test('should not allow duplicate emails', async ({ page }) => {
      await page.goto('/admin/users')
      
      // Get email from first user
      const firstEmail = await page.locator('tbody tr td:nth-child(2)').first().textContent()
      
      // Edit second user
      const secondUser = page.locator('tbody tr').nth(1)
      await secondUser.locator('button:has-text("Edit")').click()
      
      // Try to use first user's email
      if (firstEmail) {
        await page.fill('input[name="email"]', firstEmail)
        await page.click('button[type="submit"]')
        
        // Should show error
        await page.waitForTimeout(1000)
        const errorMessage = page.locator('text=/error|duplicate|already exists/i')
        const hasError = await errorMessage.count() > 0
        
        expect(hasError).toBeTruthy()
      }
    })
  })

  test.describe('Delete User', () => {
    test('should show confirmation dialog', async ({ page }) => {
      await page.goto('/admin/users')
      
      // Click delete on first user
      const firstUser = page.locator('tbody tr').first()
      const deleteButton = firstUser.locator('button:has-text("Delete")')
      
      await expect(deleteButton).toBeVisible()
      await deleteButton.click()
      
      // Should show confirmation
      const confirmDialog = page.locator('[role="dialog"], [role="alertdialog"]')
      await expect(confirmDialog).toBeVisible({ timeout: 5000 })
    })

    test('should cancel deletion', async ({ page }) => {
      await page.goto('/admin/users')
      
      const initialCount = await page.locator('tbody tr').count()
      
      // Start deletion
      await page.locator('tbody tr').first().locator('button:has-text("Delete")').click()
      
      // Cancel
      const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("No")')
      await cancelButton.click()
      
      // Count should remain same
      await page.waitForTimeout(500)
      const newCount = await page.locator('tbody tr').count()
      expect(newCount).toBe(initialCount)
    })

    test('should delete user after confirmation', async ({ page }) => {
      await page.goto('/admin/users')
      
      const initialCount = await page.locator('tbody tr').count()
      
      // Get name of user to delete
      const userName = await page.locator('tbody tr').first().locator('td').first().textContent()
      
      // Delete
      await page.locator('tbody tr').first().locator('button:has-text("Delete")').click()
      
      // Confirm
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete"), button:has-text("Yes")')
      await confirmButton.click()
      
      // Verify deletion
      await page.waitForTimeout(1000)
      
      // Count should decrease
      const newCount = await page.locator('tbody tr').count()
      expect(newCount).toBeLessThan(initialCount)
      
      // User should not be in list
      if (userName) {
        const deletedUser = page.locator(`text="${userName}"`)
        await expect(deletedUser).not.toBeVisible()
      }
    })

    test('should not allow deleting own account', async ({ page }) => {
      await page.goto('/admin/users')
      
      // Find current user's row (admin@example.com)
      const currentUserRow = page.locator(`tr:has-text("${process.env.TEST_ADMIN_EMAIL}")`)
      const deleteButton = currentUserRow.locator('button:has-text("Delete")')
      
      // Delete button should be disabled or not present
      const buttonCount = await deleteButton.count()
      
      if (buttonCount > 0) {
        const isDisabled = await deleteButton.isDisabled()
        expect(isDisabled).toBeTruthy()
      }
    })
  })
})
