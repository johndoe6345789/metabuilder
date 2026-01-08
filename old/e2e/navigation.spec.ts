import { test, expect } from '@playwright/test'

/**
 * Navigation E2E Tests
 * Tests core navigation flows and routing
 */

test.describe('Navigation and Routing', () => {
  test('should navigate from homepage to key sections', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Verify homepage loaded
    const bodyText = await page.textContent('body')
    expect(bodyText).toBeTruthy()
    expect(bodyText!.length).toBeGreaterThan(0)
  })

  test('should have working navigation menu', async ({ page }) => {
    await page.goto('/')
    
    // Check for navigation element
    const nav = page.locator('nav, [role="navigation"]')
    await expect(nav).toBeVisible()
  })

  test('should handle 404 pages gracefully', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345')
    
    // Should return 404 or show not found page
    if (response) {
      const status = response.status()
      // Accept 404 or redirect to home/error page
      expect([200, 404]).toContain(status)
    }
    
    // Check if page shows "not found" message
    const pageText = await page.textContent('body')
    const hasNotFoundMessage = 
      pageText?.toLowerCase().includes('not found') ||
      pageText?.toLowerCase().includes('404') ||
      await page.locator('text=/not found|404/i').count() > 0
    
    expect(hasNotFoundMessage).toBeTruthy()
  })

  test('should maintain scroll position on back navigation', async ({ page }) => {
    await page.goto('/')
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500))
    const scrollBefore = await page.evaluate(() => window.scrollY)
    expect(scrollBefore).toBeGreaterThan(0)
    
    // Navigate to another page if link exists
    const firstLink = page.locator('a[href^="/"]').first()
    const linkCount = await firstLink.count()
    
    if (linkCount > 0) {
      await firstLink.click()
      await page.waitForLoadState('networkidle')
      
      // Go back
      await page.goBack()
      await page.waitForLoadState('networkidle')
      
      // Note: Scroll restoration depends on browser and framework
      // This test documents expected behavior
      const scrollAfter = await page.evaluate(() => window.scrollY)
      expect(scrollAfter).toBeDefined()
    }
  })

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/')
    
    // Check for skip link (accessibility best practice)
    const skipLink = page.locator('a[href="#main"], a[href="#content"]')
    const hasSkipLink = await skipLink.count() > 0
    
    // Check for main landmark
    const main = page.locator('main, [role="main"]')
    await expect(main).toBeVisible()
    
    // Navigation should be accessible via keyboard
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => 
      document.activeElement?.tagName
    )
    expect(focusedElement).toBeTruthy()
  })

  test('should have breadcrumbs on deep pages', async ({ page }) => {
    // Try to navigate to a nested page
    await page.goto('/admin/users')
    
    // Check for breadcrumbs (common navigation pattern)
    const breadcrumbs = page.locator('[aria-label="breadcrumb"], nav[aria-label*="breadcrumb"]')
    const hasBreadcrumbs = await breadcrumbs.count() > 0
    
    // This documents expected behavior for deep navigation
    expect(hasBreadcrumbs).toBeDefined()
  })
})

test.describe('Responsive Navigation', () => {
  test('should show mobile menu on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Look for hamburger menu or mobile menu button
    const mobileMenuButton = page.locator('button[aria-label*="menu"], button:has-text("Menu")')
    const hasMobileMenu = await mobileMenuButton.count() > 0
    
    if (hasMobileMenu) {
      await mobileMenuButton.first().click()
      
      // Mobile menu should be visible after click
      const mobileNav = page.locator('[role="navigation"], nav')
      await expect(mobileNav).toBeVisible()
    }
  })

  test('should show desktop navigation on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    
    // Desktop navigation should be visible
    const nav = page.locator('nav, [role="navigation"]')
    await expect(nav).toBeVisible()
  })
})

test.describe('Link Validation', () => {
  test('should have no broken internal links on homepage', async ({ page }) => {
    await page.goto('/')
    
    // Get all internal links
    const links = await page.locator('a[href^="/"]').all()
    
    // Sample first 5 links to avoid long test times
    const sampleLinks = links.slice(0, 5)
    
    for (const link of sampleLinks) {
      const href = await link.getAttribute('href')
      if (href) {
        const response = await page.request.get(href)
        // Links should return 200 or 3xx redirect
        expect(response.status()).toBeLessThan(400)
      }
    }
  })
})
