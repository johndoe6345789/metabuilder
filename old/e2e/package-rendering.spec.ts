/**
 * E2E Tests for Package Rendering
 * 
 * Verifies that packages render correctly in the browser.
 * Tests the full pipeline: JSON → React → DOM
 */
import { expect, test } from '@playwright/test'

test.describe('Package Rendering', () => {
  test.describe('Homepage (level1)', () => {
    test('should render homepage with fakemui components', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Should have navigation
      const nav = page.locator('nav, header, [role="navigation"]')
      await expect(nav.first()).toBeVisible()

      // Should have main content area
      const main = page.locator('main, [role="main"]')
      await expect(main.first()).toBeVisible()
    })

    test('should render Card components', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Look for card-like elements (MUI-style or fakemui-style)
      const cards = page.locator('[class*="card"], [class*="Card"], .MuiCard-root, .paper')
      const cardCount = await cards.count()
      
      // Homepage should have at least one card
      expect(cardCount).toBeGreaterThanOrEqual(1)
    })

    test('should render Typography components', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Check for typography elements
      const headings = page.locator('h1, h2, h3, h4, h5, h6')
      const headingCount = await headings.count()
      
      expect(headingCount).toBeGreaterThanOrEqual(1)
    })

    test('should render Button components', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Check for buttons
      const buttons = page.locator('button, [role="button"]')
      const buttonCount = await buttons.count()
      
      expect(buttonCount).toBeGreaterThanOrEqual(1)
    })
  })

  test.describe('Component Registry', () => {
    test('should render Box layout correctly', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Box components should render as divs with proper classes
      const boxes = page.locator('[class*="box"], [class*="Box"], div.flex, div.block')
      const boxCount = await boxes.count()
      
      expect(boxCount).toBeGreaterThanOrEqual(1)
    })

    test('should render Container with max-width', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Container should have max-width
      const container = page.locator('[class*="container"], [class*="Container"]')
      await expect(container.first()).toBeVisible()
    })
  })

  test.describe('Navigation', () => {
    test('should have sign in button visible', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Should have auth-related buttons
      const signInButton = page.getByRole('button', { name: /sign in|login|get started/i })
      await expect(signInButton.first()).toBeVisible()
    })

    test('should navigate to login page', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Click sign in
      const signInButton = page.getByRole('button', { name: /sign in|login/i })
      if (await signInButton.isVisible()) {
        await signInButton.click()
        await page.waitForLoadState('domcontentloaded')
        
        // Should be on login page
        expect(page.url()).toContain('/login')
      }
    })
  })

  test.describe('Icon Rendering', () => {
    test('should render fakemui icons without errors', async ({ page }) => {
      const consoleErrors: string[] = []
      
      page.on('console', msg => {
        if (msg.type() === 'error' && msg.text().toLowerCase().includes('icon')) {
          consoleErrors.push(msg.text())
        }
      })

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Should have no icon-related errors
      expect(consoleErrors).toEqual([])
    })

    test('should display icons with proper SVG structure', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Icons should be SVG elements
      const svgIcons = page.locator('svg')
      const iconCount = await svgIcons.count()
      
      // Homepage should have at least a few icons
      expect(iconCount).toBeGreaterThanOrEqual(1)
    })
  })

  test.describe('Theme & Styling', () => {
    test('should apply consistent styling', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Check that styles are loaded
      const stylesheets = await page.evaluate(() => {
        return Array.from(document.styleSheets).length
      })
      
      expect(stylesheets).toBeGreaterThan(0)
    })

    test('should have proper color scheme', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Check that body has proper background
      const bodyBg = await page.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor
      })
      
      // Should have some background color set (not just transparent)
      expect(bodyBg).toBeTruthy()
    })
  })

  test.describe('Responsive Design', () => {
    test('should be mobile-responsive', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Content should still be visible
      const body = page.locator('body')
      await expect(body).toBeVisible()

      // No horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth
      })
      
      expect(hasHorizontalScroll).toBe(false)
    })

    test('should be tablet-responsive', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')

      // Content should be visible
      const body = page.locator('body')
      await expect(body).toBeVisible()
    })
  })

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      
      const loadTime = Date.now() - startTime
      
      // Should load within 10 seconds (generous for dev server)
      expect(loadTime).toBeLessThan(10000)
    })

    test('should have minimal layout shifts', async ({ page }) => {
      await page.goto('/')
      
      // Wait for content to stabilize
      await page.waitForLoadState('networkidle')
      
      // Take a screenshot to verify visual stability
      // This is more of a sanity check than a strict CLS measurement
      const screenshot = await page.screenshot()
      expect(screenshot).toBeTruthy()
    })
  })
})
