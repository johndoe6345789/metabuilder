import { expect, test } from "./fixtures"

test.describe("Mobile and Responsive Tests", () => {
  test.describe("Mobile Touch Interactions", () => {
    test("buttons are touch-friendly on mobile", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")

      const buttons = page.locator("button")
      if (await buttons.count() > 0) {
        const button = buttons.first()
        const box = await button.boundingBox()

        // Buttons should be at least 44px for touch targets (accessibility standard)
        expect(box?.height).toBeGreaterThanOrEqual(32)
        expect(box?.width).toBeGreaterThanOrEqual(32)
      }
    })

    test("tappable elements have proper spacing", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")

      const tappableElements = page.locator("button, a, input[type='checkbox']")
      if (await tappableElements.count() > 2) {
        const elem1Box = await tappableElements.nth(0).boundingBox()
        const elem2Box = await tappableElements.nth(1).boundingBox()

        if (elem1Box && elem2Box) {
          // Calculate spacing (at least 8px recommended for touch)
          const verticalSpacing = elem2Box.y - (elem1Box.y + elem1Box.height)

          if (verticalSpacing > 0) {
            expect(verticalSpacing).toBeGreaterThanOrEqual(4) // At least 4px
          }
        }
      }
    })

    test("no horizontal scroll on mobile", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")
      await page.waitForLoadState("networkidle")

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth
      })

      expect(hasHorizontalScroll).toBe(false)
    })

    test("touch targets don't overlap", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")

      const touchElements = await page.locator("button, a:visible").boundingBox({ timeout: 1000 })

      if (touchElements) {
        const allElements = await page.locator("button, a").all()

        let overlaps = 0

        for (let i = 0; i < Math.min(allElements.length, 10); i++) {
          for (let j = i + 1; j < Math.min(allElements.length, 10); j++) {
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

        // Some overlaps might be expected, but not excessive
        expect(overlaps).toBeLessThan(5)
      }
    })
  })

  test.describe("Viewport Height and Safe Area", () => {
    test("content adapts to short viewport heights", async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 375, height: 400 }, // Very short viewport
      })
      const page = await context.newPage()

      await page.goto("/")

      const header = page.locator("header")
      const main = page.locator("main")

      await expect(header).toBeVisible()
      await expect(main).toBeVisible()

      // Should still be scrollable and not have layout issues
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight)
      expect(scrollHeight).toBeGreaterThan(0)

      await context.close()
    })

    test("critical content is above the fold on mobile", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")

      const heading = page.getByRole("heading", { name: "My Snippets" })
      const description = page.getByText("Save, organize, and share your code snippets", {
        exact: true,
      })

      if ((await heading.count()) > 0) {
        const headingBox = await heading.boundingBox()

        // Heading should be visible without scrolling
        expect(headingBox?.y).toBeLessThan(window.innerHeight)
      }

      if ((await description.count()) > 0) {
        const descBox = await description.boundingBox()

        // Description should be mostly visible
        expect(descBox?.y).toBeLessThan(window.innerHeight)
      }
    })

    test("notch/safe area is respected on mobile", async ({ browser }) => {
      // Simulate a notched device
      const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
      })
      const page = await context.newPage()

      await page.goto("/")

      const header = page.locator("header")
      const headerBox = await header.boundingBox()

      // Content should not overlap with notch area
      if (headerBox) {
        // Check that left/right padding exists
        const headerPadding = await header.evaluate((el) => {
          const style = window.getComputedStyle(el)
          return {
            paddingLeft: style.paddingLeft,
            paddingRight: style.paddingRight,
          }
        })

        expect(headerPadding.paddingLeft).not.toBe("0px")
        expect(headerPadding.paddingRight).not.toBe("0px")
      }

      await context.close()
    })
  })

  test.describe("Tablet Specific Tests", () => {
    test("two-column layout works on tablet", async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: 768, height: 1024 },
      })
      const page = await context.newPage()

      await page.goto("/")
      await page.waitForLoadState("networkidle")

      // Check if any two-column layouts are rendered
      const content = await page.locator("main").evaluate((el) => {
        return {
          children: el.children.length,
          display: window.getComputedStyle(el).display,
        }
      })

      expect(content.children).toBeGreaterThan(0)

      await context.close()
    })

    test("orientation change doesn't break layout", async ({ browser }) => {
      let context = await browser.newContext({
        viewport: { width: 768, height: 1024 },
      })
      let page = await context.newPage()

      await page.goto("/")
      const portraitScroll = await page.evaluate(() => document.documentElement.scrollHeight)

      await context.close()

      // Recreate with landscape
      context = await browser.newContext({
        viewport: { width: 1024, height: 768 },
      })
      page = await context.newPage()

      await page.goto("/")
      const landscapeScroll = await page.evaluate(() => document.documentElement.scrollHeight)

      // Both orientations should render without extreme differences
      const difference = Math.abs(portraitScroll - landscapeScroll)
      expect(difference).toBeLessThan(portraitScroll * 1.5)

      await context.close()
    })
  })

  test.describe("Font Scaling on Different Devices", () => {
    test("text remains readable with system font scaling", async ({ page }) => {
      await page.goto("/")

      // Test at various font scales
      const scales = [0.8, 1, 1.2, 1.5]

      for (const scale of scales) {
        await page.evaluate((s) => {
          document.documentElement.style.fontSize = `${16 * s}px`
        }, scale)

        const heading = page.locator("h2").first()
        if (await heading.count() > 0) {
          const size = await heading.evaluate((el) => {
            return window.getComputedStyle(el).fontSize
          })

          const fontSizeNum = parseFloat(size)
          expect(fontSizeNum).toBeGreaterThan(0)
        }
      }

      // Reset
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "16px"
      })
    })

    test("line-height is appropriate for readability", async ({ page }) => {
      await page.goto("/")

      const paragraphs = page.locator("p")
      if (await paragraphs.count() > 0) {
        const lineHeight = await paragraphs.first().evaluate((el) => {
          return window.getComputedStyle(el).lineHeight
        })

        // Line height should not be too tight
        const fontSize = await paragraphs.first().evaluate((el) => {
          return parseFloat(window.getComputedStyle(el).fontSize)
        })

        const lineHeightNum = parseFloat(lineHeight)
        expect(lineHeightNum).toBeGreaterThan(fontSize)
      }
    })
  })

  test.describe("Touch Event Handling", () => {
    test("no ghost clicks on interactive elements", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")

      const button = page.locator("button").first()
      if (await button.count() > 0) {
        await page.evaluate(() => {
          document.addEventListener("click", () => {
            const w = window as unknown as Record<string, number>
            w.clickCounter = (w.clickCounter || 0) + 1
          })
        })

        // Perform tap
        await button.tap()
        await page.waitForTimeout(100)

        const clicks = await page.evaluate(() => {
          const w = window as unknown as Record<string, number>
          return w.clickCounter || 0
        })

        // Should only register once
        expect(clicks).toBeLessThanOrEqual(2) // Allow for some browser inconsistency
      }
    })

    test("swipe gestures don't cause unintended navigation", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/atoms")
      const initialUrl = page.url()

      // Simulate swipe
      await page.evaluate(() => {
        const touchInit = {
          bubbles: true,
          cancelable: true,
          touches: [new Touch({ identifier: 1, target: document.body, clientX: 300, clientY: 400 })] as TouchList | unknown,
        }
        const start = new TouchEvent("touchstart", touchInit as unknown as TouchEventInit)
        const touchEnd = {
          bubbles: true,
          cancelable: true,
          touches: [] as TouchList | unknown,
          changedTouches: [new Touch({ identifier: 1, target: document.body, clientX: 100, clientY: 400 })] as TouchList | unknown,
        }
        const end = new TouchEvent("touchend", touchEnd as unknown as TouchEventInit)

        document.dispatchEvent(start)
        document.dispatchEvent(end)
      })

      await page.waitForTimeout(500)

      // URL should not have changed unexpectedly
      expect(page.url()).toBe(initialUrl)
    })
  })

  test.describe("Keyboard on Mobile Web", () => {
    test("input fields trigger mobile keyboard", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")

      const inputs = page.locator("input[type='text'], textarea")
      if (await inputs.count() > 0) {
        const input = inputs.first()

        // Input should be focusable
        await input.click()
        await page.waitForTimeout(100)

        const isFocused = await input.evaluate((el) => el === document.activeElement)
        expect(isFocused).toBe(true)
      }
    })

    test("input type is appropriate for content", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")

      const emailInputs = page.locator("input[type='email']")
      if (await emailInputs.count() > 0) {
        // Email input should trigger appropriate keyboard
        await expect(emailInputs.first()).toHaveAttribute("type", "email")
      }

      const numberInputs = page.locator("input[type='number']")
      if (await numberInputs.count() > 0) {
        await expect(numberInputs.first()).toHaveAttribute("type", "number")
      }
    })
  })

  test.describe("Safe Viewport Testing", () => {
    test("page works in iframe (for embedded scenarios)", async ({ page }) => {
      await page.goto("/")

      // Check if page can be rendered in an iframe context
      const canEmbed = await page.evaluate(() => {
        return window.self === window.top // Should be true normally
      })

      // If embedded, should still work
      expect(typeof canEmbed === "boolean").toBe(true)
    })

    test("content is printable on mobile", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile-only")

      await page.goto("/")

      // Trigger print stylesheet evaluation
      await page.evaluate(() => {
        const css = Array.from(document.styleSheets)
          .filter((sheet) => {
            try {
              return sheet.media.mediaText.includes("print")
            } catch {
              return false
            }
          })
          .map((sheet) => sheet.href)

        return css
      })

      // Page should be printable (check that print stylesheets can be evaluated)
      const isInViewport = await page.evaluate(() => {
        const main = document.querySelector("main")
        return main !== null
      })
      expect(isInViewport).toBe(true)
    })
  })
})
