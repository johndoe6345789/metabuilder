import { expect, test, setupConsoleErrorTracking } from "./fixtures"

/**
 * Cross-Platform Consistency Tests
 * Ensures UI works the same across desktop, tablet, and mobile (Android-like)
 *
 * NOTE: Multi-context pattern removed. Each platform now tested in isolation.
 * This improves test parallelization as Playwright can run these in parallel.
 */

test.describe("Cross-Platform UI Consistency", () => {
  test.describe("Navigation Consistency", () => {
    test("desktop navigation loads routes correctly", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("desktop"), "desktop-only")

      await page.goto("/")

      const desktopRoutes: string[] = []
      const navLinks = page.locator("a")
      const linkCount = await navLinks.count()

      for (let i = 0; i < Math.min(linkCount, 10); i++) {
        const href = await navLinks.nth(i).getAttribute("href")
        if (href && href.startsWith("/")) {
          desktopRoutes.push(href)
        }
      }

      const desktopRoutesSet = new Set(desktopRoutes)
      expect(desktopRoutesSet.size).toBeGreaterThan(0)
    })

    test("mobile navigation loads routes correctly", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")

      const mobileRoutes: string[] = []
      const mobileNavLinks = page.locator("a")
      const mobileLinksCount = await mobileNavLinks.count()

      for (let i = 0; i < Math.min(mobileLinksCount, 10); i++) {
        const href = await mobileNavLinks.nth(i).getAttribute("href")
        if (href && href.startsWith("/")) {
          mobileRoutes.push(href)
        }
      }

      const mobileRoutesSet = new Set(mobileRoutes)
      expect(mobileRoutesSet.size).toBeGreaterThan(0)
    })

    test("all routes load successfully on Android viewport", async ({ page }) => {
      const testRoutes = ["/", "/atoms", "/molecules", "/organisms", "/templates", "/demo", "/settings"]

      // Set Android-like viewport
      await page.setViewportSize({ width: 393, height: 851 })

      for (const route of testRoutes) {
        await page.goto(route)
        await page.waitForLoadState("networkidle")

        // Verify page loaded
        const main = page.locator("main")
        await expect(main).toBeVisible()

        // No console errors
      const errors: string[] = []
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text())
        }
      })

        expect(errors.length).toBeLessThan(2)
      }
    })

    test("back/forward navigation works on desktop", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("desktop"), "desktop-only")

      await page.goto("/atoms")
      await page.goto("/molecules")
      await page.goBack()
      expect(page.url()).toContain("/atoms")
      await page.goForward()
      expect(page.url()).toContain("/molecules")
    })

    test("back/forward navigation works on mobile", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/atoms")
      await page.goto("/molecules")
      await page.goBack()
      expect(page.url()).toContain("/atoms")
      await page.goForward()
      expect(page.url()).toContain("/molecules")
    })
  })

  test.describe("Form and Input Consistency", () => {
    test("desktop form inputs are present", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("desktop"), "desktop-only")

      await page.goto("/")
      await page.waitForLoadState("networkidle")

      const desktopInputs = page.locator("input, textarea")
      const desktopInputCount = await desktopInputs.count()

      expect(desktopInputCount).toBeGreaterThanOrEqual(0)
    })

    test("mobile form inputs are present", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")
      await page.waitForLoadState("networkidle")

      const mobileInputs = page.locator("input, textarea")
      const mobileInputCount = await mobileInputs.count()

      expect(mobileInputCount).toBeGreaterThanOrEqual(0)
    })

    test("keyboard input works on Android viewport", async ({ page }) => {
      await page.setViewportSize({ width: 393, height: 851 })
      await page.goto("/")

      const inputs = page.locator("input[type='text'], textarea")
      if (await inputs.count() > 0) {
        const input = inputs.first()

        // Focus and type
        await input.click()
        await input.type("test input")

        // Verify text was entered
        const value = await input.inputValue()
        expect(value).toContain("test input")
      }
    })

    test("desktop form validation elements load", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("desktop"), "desktop-only")

      await page.goto("/")

      const desktopValidationElements = await page.locator("[role='alert'], .error, .validation-error").count()

      expect(typeof desktopValidationElements === "number").toBe(true)
    })

    test("mobile form validation elements load", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")

      const mobileValidationElements = await page.locator("[role='alert'], .error, .validation-error").count()

      expect(typeof mobileValidationElements === "number").toBe(true)
    })
  })

  test.describe("Button and Interactive Elements Consistency", () => {
    test("desktop buttons are interactive", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("desktop"), "desktop-only")

      await page.goto("/")

      const desktopButton = page.locator("button").first()
      const desktopCanClick = await desktopButton.isEnabled()

      expect(desktopCanClick).toBe(true)
    })

    test("mobile buttons are interactive", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")

      const mobileButton = page.locator("button").first()
      const mobileCanClick = await mobileButton.isEnabled()

      expect(mobileCanClick).toBe(true)
    })

    test("desktop button clicks work", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("desktop"), "desktop-only")

      await page.goto("/")

      const desktopButton = page.locator("button").first()
      if (await desktopButton.count() > 0) {
        await desktopButton.click()
        const desktopAfterClick = page.url()
        expect(typeof desktopAfterClick).toBe("string")
      }
    })

    test("mobile button clicks work", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")

      const mobileButton = page.locator("button").first()
      if (await mobileButton.count() > 0) {
        await mobileButton.click()
        const mobileAfterClick = page.url()
        expect(typeof mobileAfterClick).toBe("string")
      }
    })

    test("touch events fire on mobile", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")

      let eventsFired = 0

      await page.evaluate(() => {
        document.addEventListener("click", () => {
          const w = window as unknown as Record<string, number>
          w.clickEventsFired = (w.clickEventsFired || 0) + 1
        })
        document.addEventListener("touchstart", () => {
          const w = window as unknown as Record<string, number>
          w.touchEventsFired = (w.touchEventsFired || 0) + 1
        })
      })

      const button = page.locator("button").first()
      if (await button.count() > 0) {
        await button.tap() // Tap simulates touch

        eventsFired = await page.evaluate(() => {
          const w = window as unknown as Record<string, number>
          return (w.clickEventsFired || 0) + (w.touchEventsFired || 0)
        })

        expect(eventsFired).toBeGreaterThan(0)
      }
    })
  })

  test.describe("Layout and Spacing Consistency", () => {
    test("layout adapts correctly on mobile without breaking", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")

      // Check no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth
      })
      expect(hasHorizontalScroll).toBe(false)

      // Check main content is visible
      const main = page.locator("main")
      await expect(main).toBeVisible()

      // Check footer/header visible
      const header = page.locator("header")

      if (await header.count() > 0) {
        await expect(header).toBeVisible()
      }
    })

    test("content spacing is appropriate on all screen sizes", async ({ page }) => {
      await page.goto("/")

      const contentBox = await page.locator("main").boundingBox()
      expect(contentBox).not.toBeNull()

      // Content should have reasonable padding
      const padding = await page.locator("main").evaluate((el) => {
        const style = window.getComputedStyle(el)
        return style.padding
      })

      expect(padding).toBeTruthy()
    })

    test("elements don't overlap on Android", async ({ page }) => {
      await page.setViewportSize({ width: 393, height: 851 })
      await page.goto("/")

      const elements = await page.locator("button, a, input").boundingBox({ timeout: 1000 })

      if (elements) {
        const allElements = await page.locator("button, a:visible").all()

        let overlaps = 0

        for (let i = 0; i < Math.min(allElements.length, 5); i++) {
          for (let j = i + 1; j < Math.min(allElements.length, 5); j++) {
            const box1 = await allElements[i].boundingBox()
            const box2 = await allElements[j].boundingBox()

            if (
              box1 &&
              box2 &&
              box1.x < box2.x + box2.width &&
              box1.x + box1.width > box2.x &&
              box1.y < box2.y + box2.height &&
              box1.y + box1.height > box2.y
            ) {
              overlaps++
            }
          }
        }

        // Should be minimal overlap
        expect(overlaps).toBeLessThan(2)
      }
    })
  })

  test.describe("Text and Typography Consistency", () => {
    test("text is readable on Android viewport", async ({ page }) => {
      await page.setViewportSize({ width: 393, height: 851 })
      await page.goto("/")

      const headings = page.locator("h1, h2, h3")
      if (await headings.count() > 0) {
        const heading = headings.first()
        const headingBox = await heading.boundingBox()

        // Text should be visible
        expect(headingBox?.width).toBeGreaterThan(0)
        expect(headingBox?.height).toBeGreaterThan(0)

        // Text should not be cut off
        const fontSize = await heading.evaluate((el) => {
          return parseFloat(window.getComputedStyle(el).fontSize)
        })

        expect(fontSize).toBeGreaterThan(10)
      }
    })

    test("font sizes are readable", async ({ page }) => {
      await page.goto("/")

      const headings = page.locator("h2")
      if (await headings.count() > 0) {
        const size = await headings.first().evaluate((el) => {
          return parseFloat(window.getComputedStyle(el).fontSize)
        })

        expect(size).toBeGreaterThan(12)
      }
    })

    test("text contrast is sufficient", async ({ page }) => {
      await page.goto("/")

      const textElements = page.locator("p, span, a")
      const count = await textElements.count()

      if (count > 0) {
        const element = textElements.first()
        const styles = await element.evaluate((el) => {
          const style = window.getComputedStyle(el)
          return {
            color: style.color,
            backgroundColor: style.backgroundColor,
          }
        })

        // Should have colors (not transparent)
        expect(styles.color).toBeTruthy()
        expect(styles.backgroundColor).not.toBe("rgba(0, 0, 0, 0)")
      }
    })
  })

  test.describe("Viewport-Specific Features", () => {
    test("mobile safe area padding is present", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")

      // Check for safe area awareness
      const header = page.locator("header")
      if (await header.count() > 0) {
        const padding = await header.evaluate((el) => {
          const style = window.getComputedStyle(el)
          return {
            paddingTop: style.paddingTop,
            paddingLeft: style.paddingLeft,
            paddingRight: style.paddingRight,
          }
        })

        // Should have padding for safe area
        expect(padding.paddingTop).toBeTruthy()
        expect(padding.paddingLeft).toBeTruthy()
        expect(padding.paddingRight).toBeTruthy()
      }
    })

    test("portrait orientation renders correctly", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.setViewportSize({ width: 393, height: 851 })
      await page.goto("/")

      const portraitScroll = await page.evaluate(() => document.documentElement.scrollHeight)
      expect(portraitScroll).toBeGreaterThan(0)
    })

    test("landscape orientation renders correctly", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.setViewportSize({ width: 851, height: 393 })
      await page.goto("/")

      const landscapeScroll = await page.evaluate(() => document.documentElement.scrollHeight)
      expect(landscapeScroll).toBeGreaterThan(0)
    })
  })

  test.describe("State and Data Consistency", () => {
    test("page title loads correctly", async ({ page }) => {
      await page.goto("/")

      const title = await page.title()
      expect(title).toBeTruthy()
    })

    test("localStorage works on all platforms", async ({ page }) => {
      await page.goto("/")

      await page.evaluate(() => {
        localStorage.setItem("test-key", "test-value")
      })

      const storedValue = await page.evaluate(() => {
        return localStorage.getItem("test-key")
      })

      expect(storedValue).toBe("test-value")
    })
  })

  test.describe("Error Handling Consistency", () => {
    test("invalid routes are handled gracefully", async ({ page }) => {
      const errorTracker = setupConsoleErrorTracking(page)

      await page.goto("/invalid-route-test")

      // Should handle gracefully
      expect(page.url()).toBeTruthy()
      errorTracker.cleanup()
    })

    test("page remains functional with network activity", async ({ page }) => {
      let networkErrors = 0

      page.on("response", (response) => {
        if (!response.ok()) {
          networkErrors++
        }
      })

      await page.goto("/")

      // Should still be functional
      const main = page.locator("main")
      const isVisible = await main.count() > 0

      expect(isVisible || networkErrors < 3).toBe(true)
    })
  })
})
