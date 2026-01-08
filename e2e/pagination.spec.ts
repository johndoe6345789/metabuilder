import { test, expect } from '@playwright/test'

/**
 * E2E tests for pagination components
 * 
 * These tests verify that pagination UI components render correctly
 * and handle user interactions properly.
 */

test.describe('Pagination Components', () => {
  test.describe('PaginationControls', () => {
    test('should render pagination controls with page numbers', async ({ page }) => {
      // Navigate to a page that uses pagination
      await page.goto('/test-pagination') // This would be a test page with pagination
      
      // Check that pagination controls are visible
      const pagination = page.locator('[aria-label="pagination navigation"]')
      await expect(pagination).toBeVisible()
      
      // Check for navigation buttons
      await expect(page.locator('button[aria-label="Go to first page"]')).toBeVisible()
      await expect(page.locator('button[aria-label="Go to previous page"]')).toBeVisible()
      await expect(page.locator('button[aria-label="Go to next page"]')).toBeVisible()
      await expect(page.locator('button[aria-label="Go to last page"]')).toBeVisible()
    })

    test('should navigate between pages when clicking page numbers', async ({ page }) => {
      await page.goto('/test-pagination')
      
      // Click on page 2
      await page.click('button[aria-label="Go to page 2"]')
      
      // Verify page 2 is now selected
      const page2Button = page.locator('button[aria-label="Go to page 2"]')
      await expect(page2Button).toHaveAttribute('aria-current', 'page')
    })

    test('should disable previous/first buttons on first page', async ({ page }) => {
      await page.goto('/test-pagination')
      
      // On first page, previous and first buttons should be disabled
      await expect(page.locator('button[aria-label="Go to first page"]')).toBeDisabled()
      await expect(page.locator('button[aria-label="Go to previous page"]')).toBeDisabled()
      
      // Next and last buttons should be enabled
      await expect(page.locator('button[aria-label="Go to next page"]')).not.toBeDisabled()
      await expect(page.locator('button[aria-label="Go to last page"]')).not.toBeDisabled()
    })

    test('should disable next/last buttons on last page', async ({ page }) => {
      await page.goto('/test-pagination')
      
      // Navigate to last page
      await page.click('button[aria-label="Go to last page"]')
      
      // On last page, next and last buttons should be disabled
      await expect(page.locator('button[aria-label="Go to next page"]')).toBeDisabled()
      await expect(page.locator('button[aria-label="Go to last page"]')).toBeDisabled()
      
      // Previous and first buttons should be enabled
      await expect(page.locator('button[aria-label="Go to previous page"]')).not.toBeDisabled()
      await expect(page.locator('button[aria-label="Go to first page"]')).not.toBeDisabled()
    })
  })

  test.describe('ItemsPerPageSelector', () => {
    test('should display items per page selector', async ({ page }) => {
      await page.goto('/test-pagination')
      
      // Check that selector is visible
      const selector = page.locator('#items-per-page-select')
      await expect(selector).toBeVisible()
    })

    test('should change page size when selecting different value', async ({ page }) => {
      await page.goto('/test-pagination')
      
      // Select 50 items per page
      await page.selectOption('#items-per-page-select', '50')
      
      // Verify the selection changed (would need to check actual data display)
      const selector = page.locator('#items-per-page-select')
      await expect(selector).toHaveValue('50')
    })
  })

  test.describe('PaginationInfo', () => {
    test('should display current page information', async ({ page }) => {
      await page.goto('/test-pagination')
      
      // Check that info text is displayed
      const infoText = page.locator('text=/Showing \\d+-\\d+ of \\d+ items/')
      await expect(infoText).toBeVisible()
    })

    test('should update info when navigating pages', async ({ page }) => {
      await page.goto('/test-pagination')
      
      // Get initial info text
      const initialInfo = await page.locator('text=/Showing \\d+-\\d+ of \\d+ items/').textContent()
      
      // Navigate to page 2
      await page.click('button[aria-label="Go to page 2"]')
      
      // Get updated info text
      const updatedInfo = await page.locator('text=/Showing \\d+-\\d+ of \\d+ items/').textContent()
      
      // Verify info changed
      expect(updatedInfo).not.toBe(initialInfo)
    })

    test('should display "No items found" when no data', async ({ page }) => {
      await page.goto('/test-pagination-empty') // Test page with no data
      
      // Check for "No items found" message
      await expect(page.locator('text=No items found')).toBeVisible()
    })
  })

  test.describe('Complete pagination flow', () => {
    test('should handle complete pagination workflow', async ({ page }) => {
      await page.goto('/test-pagination')
      
      // 1. Verify initial state
      await expect(page.locator('button[aria-label="Go to page 1"]')).toHaveAttribute('aria-current', 'page')
      await expect(page.locator('text=/Showing 1-\\d+ of \\d+ items/')).toBeVisible()
      
      // 2. Change items per page
      await page.selectOption('#items-per-page-select', '50')
      
      // 3. Navigate to different page
      await page.click('button[aria-label="Go to page 2"]')
      await expect(page.locator('button[aria-label="Go to page 2"]')).toHaveAttribute('aria-current', 'page')
      
      // 4. Use next button
      await page.click('button[aria-label="Go to next page"]')
      await expect(page.locator('button[aria-label="Go to page 3"]')).toHaveAttribute('aria-current', 'page')
      
      // 5. Go to last page
      await page.click('button[aria-label="Go to last page"]')
      
      // 6. Use previous button
      await page.click('button[aria-label="Go to previous page"]')
      
      // 7. Go back to first page
      await page.click('button[aria-label="Go to first page"]')
      await expect(page.locator('button[aria-label="Go to page 1"]')).toHaveAttribute('aria-current', 'page')
    })
  })
})
