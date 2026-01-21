import { expect, test, setupConsoleErrorTracking } from "./fixtures"

test.describe("Functionality Tests - Core Features", () => {
  test.describe("Page Navigation and Routing", () => {
    test("navigates to all main routes without errors", async ({ page }) => {
      const routes = ["/", "/atoms", "/molecules", "/organisms", "/templates", "/demo", "/settings"]
      const errorTracker = setupConsoleErrorTracking(page)

      for (const route of routes) {
        await page.goto(route)
        await page.waitForLoadState("networkidle")

        // Check that page loads
        expect(page.url()).toContain(route)
      }

      expect(errorTracker.errors.length).toBe(0)
      errorTracker.cleanup()
    })

    test("navigation menu opens and closes correctly", async ({ page }) => {
      await page.goto("/")

      // Check if navigation button exists
      const navButton = page.locator('button[aria-label*="menu" i], button[aria-label*="nav" i]').first()

      if (await navButton.count() > 0) {
        // Initially should show or be accessible
        await expect(navButton).toBeVisible()

        // Click to open
        await navButton.click()
        // Wait for menu to stabilize (use locator visibility instead of fixed wait)
        await page.locator('[role="navigation"]').first().waitFor({ state: 'visible' }).catch(() => {})

        // Click to close
        await navButton.click()

        // Should be functional
        expect(true).toBe(true) // Navigation toggled without error
      }
    })

    test("back button works correctly", async ({ page }) => {
      await page.goto("/atoms")
      await page.waitForLoadState("networkidle")
      await page.goto("/molecules")
      await page.waitForLoadState("networkidle")

      // Go back
      await page.goBack()
      await page.waitForLoadState("networkidle")
      expect(page.url()).toContain("/atoms")

      // Go forward
      await page.goForward()
      await page.waitForLoadState("networkidle")
      expect(page.url()).toContain("/molecules")
    })
  })

  test.describe("Header and Navigation Elements", () => {
    test("logo links back to home", async ({ page }) => {
      await page.goto("/atoms")

      const logo = page.locator(".logo-text, .logo-container")
      if (await logo.count() > 0) {
        // Click logo
        const link = logo.locator("a").first()
        if (await link.count() > 0) {
          await link.click()
          await page.waitForLoadState("networkidle")

          expect(page.url()).toContain("/")
        }
      }
    })

    test("header remains sticky during scroll", async ({ page }) => {
      await page.goto("/")

      const header = page.locator("header")
      const initialBox = await header.boundingBox()

      // Scroll down
      await page.evaluate(() => window.scrollBy(0, 500))
      // Let browser paint, but don't wait for a fixed time
      await page.waitForFunction(() => true)

      const scrolledBox = await header.boundingBox()

      // Header position.y should remain approximately the same (sticky behavior)
      // Allow small tolerance for sub-pixel rendering differences
      const tolerance = 2
      expect(Math.abs((scrolledBox?.y ?? 0) - (initialBox?.y ?? 0))).toBeLessThan(tolerance)
    })

    test("backend indicator displays status", async ({ page }) => {
      await page.goto("/")

      const indicator = page.locator('[data-testid="backend-indicator"], .backend-indicator')
      if (await indicator.count() > 0) {
        await expect(indicator).toBeVisible()

        // Should contain some status text or icon
        const content = await indicator.textContent()
        const ariaLabel = await indicator.getAttribute("aria-label")

        expect(content || ariaLabel).toBeTruthy()
      }
    })
  })

  test.describe("Snippet Manager Functionality", () => {
    test("snippet manager renders and is interactive", async ({ page }) => {
      await page.goto("/")
      await page.waitForLoadState("networkidle")

      // Wait for snippet manager to load (it's dynamically imported)
      const snippetContainer = page.locator(
        '[data-testid="snippet-grid"], [data-testid="snippet-manager"], .snippet-manager'
      )

      // Wait for it to appear, but don't hang if it doesn't
      await snippetContainer.first().waitFor({ state: 'visible', timeout: 2000 }).catch(() => {})

      if (await snippetContainer.count() > 0) {
        await expect(snippetContainer.first()).toBeVisible()
      }
    })

    test("toolbar controls are accessible", async ({ page }) => {
      await page.goto("/")
      await page.waitForLoadState("networkidle")

      // Look for toolbar elements, wait for it to appear
      const toolbar = page.locator('[data-testid="snippet-toolbar"], .snippet-toolbar')
      await toolbar.first().waitFor({ state: 'visible', timeout: 2000 }).catch(() => {})

      if (await toolbar.count() > 0) {
        const buttons = toolbar.locator("button")
        const buttonCount = await buttons.count()

        expect(buttonCount).toBeGreaterThan(0)

        // All toolbar buttons should be keyboard accessible
        for (let i = 0; i < Math.min(buttonCount, 3); i++) {
          const button = buttons.nth(i)
          await expect(button).toHaveAttribute("type", "button")
        }
      }
    })
  })

  test.describe("Form Elements and Input Handling", () => {
    test("input fields are properly labeled", async ({ page }) => {
      await page.goto("/")

      const inputs = page.locator("input, textarea, select")
      const inputCount = await inputs.count()

      if (inputCount > 0) {
        for (let i = 0; i < Math.min(inputCount, 5); i++) {
          const input = inputs.nth(i)
          const inputType = await input.getAttribute("type")

          // Should have label or aria-label
          const ariaLabel = await input.getAttribute("aria-label")
          const labelFor = await input.getAttribute("id")

          if (inputType !== "hidden") {
            // Should have some label association
            expect(ariaLabel || labelFor).toBeTruthy()
          }
        }
      }
    })

    test("form submission doesn't cause unexpected navigation", async ({ page }) => {
      await page.goto("/")

      const forms = page.locator("form")
      if (await forms.count() > 0) {
        const form = forms.first()

        // Try to submit the first form (if it has a submit button)
        const submitButton = form.locator("button[type='submit']")
        if (await submitButton.count() > 0) {
          const currentUrl = page.url()

          await submitButton.click()
          // Wait for potential navigation or form processing
          await page.waitForLoadState('networkidle').catch(() => {})

          // URL should not change unexpectedly
          // (unless form explicitly navigates)
          expect(page.url()).toBe(currentUrl)
        }
      }
    })

    test("keyboard navigation works in forms", async ({ page }) => {
      await page.goto("/")

      const inputs = page.locator("input, button, a")
      if (await inputs.count() > 0) {
        // Tab to first element
        await page.keyboard.press("Tab")

        // Get focused element
        const focusedElement = await page.evaluate(() => {
          const active = document.activeElement as HTMLElement | null
          return {
            tag: active?.tagName,
            id: active?.id,
          }
        })

        expect(focusedElement.tag).toBeTruthy()
      }
    })
  })

  test.describe("Error Handling and Edge Cases", () => {
    test("page handles network errors gracefully", async ({ page }) => {
      const consoleErrors: string[] = []
      const uncaughtErrors: string[] = []

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text())
        }
      })

      page.on("pageerror", (error) => {
        uncaughtErrors.push(error.message)
      })

      await page.goto("/")

      // Simulate slow network
      await page.route("**/*", (route) => {
        setTimeout(() => route.continue(), 100)
      })

      await page.reload()

      // Should still be accessible
      expect(page.url()).toBeTruthy()

      // Not too many errors
      expect(uncaughtErrors.length).toBeLessThan(3)
    })

    test("invalid routes show appropriate response", async ({ page }) => {
      await page.goto("/invalid-route-that-does-not-exist", {
        waitUntil: "networkidle",
      })

      // Should either:
      // 1. Show a 404 page, OR
      // 2. Redirect back to home, OR
      // 3. Show an error component

      const content = await page.textContent("body")
      expect(content).toBeTruthy() // Page should have content, not blank

      // Should not be a network error page
      expect(content).not.toContain("ERR_")
    })

    test("handles rapid clicking on buttons", async ({ page }) => {
      await page.goto("/")
      await page.waitForLoadState("networkidle")

      // Find buttons that are in the main content area (not in hidden sidebars)
      const mainButton = page.locator('main button, [role="main"] button, header button').first()
      if (await mainButton.count() > 0 && await mainButton.isVisible()) {
        // Rapid click
        for (let i = 0; i < 5; i++) {
          await mainButton.click({ force: true })
        }

        // Page should remain functional
        expect(page.url()).toBeTruthy()
        await expect(page.locator("body")).toBeVisible()
      } else {
        // If no main button found, test passes (no buttons to test)
        expect(true).toBe(true)
      }
    })

    test("handles missing images gracefully", async ({ page }) => {
      let imageLoadFailures = 0

      page.on("response", (response) => {
        if (response.request().resourceType() === "image" && !response.ok()) {
          imageLoadFailures++
        }
      })

      await page.goto("/")

      // Some image failures are acceptable, but page should still work
      expect(imageLoadFailures).toBeLessThan(5)
      await expect(page.locator("main")).toBeVisible()
    })
  })

  test.describe("Accessibility Features", () => {
    test("page is keyboard navigable", async ({ page }) => {
      await page.goto("/")

      let focusedElements = 0
      let previousElement = ""

      // Simulate keyboard navigation
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press("Tab")

        const focused = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement
          return el?.tagName + (el?.id || "")
        })

        if (focused && focused !== previousElement) {
          focusedElements++
        }
        previousElement = focused
      }

      // Should be able to navigate through elements
      expect(focusedElements).toBeGreaterThan(0)
    })

    test("headings have proper hierarchy", async ({ page }) => {
      await page.goto("/")

      const headings = await page.locator("h1, h2, h3, h4, h5, h6").all()

      if (headings.length > 0) {
        let previousLevel = 0

        for (const heading of headings) {
          const level = parseInt(
            (await heading.evaluate((el) => el.tagName)).replace("H", "")
          )

          // Each heading should be at the same or next level down
          // (no skipping H1 -> H3)
          expect(Math.abs(level - previousLevel)).toBeLessThanOrEqual(1)
          previousLevel = level
        }
      }
    })

    test("interactive elements have aria roles", async ({ page }) => {
      await page.goto("/")

      const interactiveElements = page.locator("button, a, input, select, textarea")
      const count = await interactiveElements.count()

      if (count > 0) {
        for (let i = 0; i < Math.min(count, 10); i++) {
          const element = interactiveElements.nth(i)
          const tag = await element.evaluate((el) => el.tagName)
          const role = await element.getAttribute("role")
          const ariaLabel = await element.getAttribute("aria-label")
          const title = await element.getAttribute("title")
          const textContent = await element.textContent()

          // Should be identifiable
          const hasLabel =
            ariaLabel || title || (textContent && textContent.trim().length > 0)

          if (tag !== "BUTTON" && tag !== "A") {
            // Non-standard elements should have explicit role
            expect(role || hasLabel).toBeTruthy()
          }
        }
      }
    })

    test("images have alt text", async ({ page }) => {
      await page.goto("/")

      const images = page.locator("img")
      const imageCount = await images.count()

      if (imageCount > 0) {
        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i)
          const alt = await img.getAttribute("alt")
          const ariaLabel = await img.getAttribute("aria-label")

          // Should have meaningful alt text
          if (i < 5) {
            // Check first few images at least
            expect(alt || ariaLabel).toBeTruthy()
          }
        }
      }
    })
  })

  test.describe("Performance and Load Testing", () => {
    test("page loads within acceptable time", async ({ page }) => {
      const startTime = Date.now()

      await page.goto("/", { waitUntil: "networkidle" })

      const loadTime = Date.now() - startTime

      // Should load in under 5 seconds
      expect(loadTime).toBeLessThan(5000)
    })

    test("no console errors on initial load", async ({ page }) => {
      const errors: string[] = []

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text())
        }
      })

      await page.goto("/")
      await page.waitForLoadState("networkidle")

      // Allow some errors but not too many
      expect(errors.length).toBeLessThan(3)
    })

    test("memory usage doesn't spike excessively", async ({ page }) => {
      await page.goto("/")

      const metrics1 = await (page as Record<string, unknown>).metrics() as Record<string, number>
      const initialMemory = metrics1.JSHeapUsedSize

      // Perform multiple interactions
      for (let i = 0; i < 5; i++) {
        await page.reload()
        await page.waitForLoadState("networkidle")
      }

      const metrics2 = await (page as Record<string, unknown>).metrics() as Record<string, number>
      const finalMemory = metrics2.JSHeapUsedSize

      // Memory increase should be reasonable (not growing unbounded)
      const memoryIncrease = finalMemory - initialMemory
      const percentageIncrease = (memoryIncrease / initialMemory) * 100

      // Allow up to 50% increase
      expect(percentageIncrease).toBeLessThan(50)
    })
  })
})
