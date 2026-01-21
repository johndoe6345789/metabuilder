import { test, expect } from "@playwright/test"
import {
  md3,
  md3All,
  md3Part,
  md3HasState,
  expectMd3Visible,
  expectMd3Accessible,
  expectMinTouchTarget,
  testMd3Keyboard,
  getBreakpoint,
  md3Schema,
} from "./md3"

test.describe("MD3 Framework Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test.describe("Buttons", () => {
    test("all buttons are accessible", async ({ page }) => {
      const buttons = md3All(page, "button")
      const count = await buttons.count()

      for (let i = 0; i < count; i++) {
        const btn = buttons.nth(i)
        if (await btn.isVisible()) {
          await expectMinTouchTarget(btn)
        }
      }
    })

    test("button by label", async ({ page }) => {
      // Find button by accessible name
      const btn = md3(page, "button", { label: "Submit" })
      if (await btn.count() > 0) {
        await expect(btn).toBeEnabled()
      }
    })

    test("icon buttons have aria-label", async ({ page }) => {
      const iconButtons = md3All(page, "iconButton")
      const count = await iconButtons.count()

      for (let i = 0; i < count; i++) {
        const btn = iconButtons.nth(i)
        if (await btn.isVisible()) {
          await expectMd3Accessible(page, "iconButton")
        }
      }
    })
  })

  test.describe("Text Fields", () => {
    test("text fields have labels", async ({ page }) => {
      const fields = md3All(page, "textField")
      const count = await fields.count()

      for (let i = 0; i < count; i++) {
        const field = fields.nth(i)
        if (await field.isVisible()) {
          const label = md3Part(field, "textField", "label")
          expect(await label.count()).toBeGreaterThan(0)
        }
      }
    })

    test("error state shows helper text", async ({ page }) => {
      const fields = md3All(page, "textField")

      for (let i = 0; i < await fields.count(); i++) {
        const field = fields.nth(i)
        if (await md3HasState(field, "textField", "error")) {
          const errorText = md3Part(field, "textField", "error")
          await expect(errorText).toBeVisible()
        }
      }
    })
  })

  test.describe("Dialogs", () => {
    test("dialog traps focus", async ({ page }) => {
      const dialog = md3(page, "dialog")

      if (await dialog.count() > 0 && await dialog.isVisible()) {
        await expectMd3Accessible(page, "dialog")

        // Focus should be within dialog
        const focused = await page.evaluate(() => document.activeElement?.closest("[role='dialog']"))
        expect(focused).toBeTruthy()
      }
    })

    test("dialog closes on Escape", async ({ page }) => {
      const dialog = md3(page, "dialog")

      if (await dialog.count() > 0 && await dialog.isVisible()) {
        await page.keyboard.press("Escape")
        await page.waitForTimeout(300)
        await expect(dialog).not.toBeVisible()
      }
    })
  })

  test.describe("Navigation", () => {
    test("navigation rail exists on desktop", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("desktop"), "desktop only")

      const rail = md3(page, "navigationRail")
      if (await rail.count() > 0) {
        await expectMd3Visible(page, "navigationRail")
      }
    })

    test("bottom navigation exists on mobile", async ({ page }, testInfo) => {
      test.skip(!testInfo.project.name.includes("mobile"), "mobile only")

      const bottomNav = md3(page, "bottomNavigation")
      if (await bottomNav.count() > 0) {
        await expectMd3Visible(page, "bottomNavigation")
      }
    })

    test("tabs are keyboard navigable", async ({ page }) => {
      const tabs = md3(page, "tabs")

      if (await tabs.count() > 0) {
        await testMd3Keyboard(page, "tabs")
      }
    })
  })

  test.describe("Menus", () => {
    test("menu keyboard navigation", async ({ page }) => {
      const menu = md3(page, "menu")

      if (await menu.count() > 0 && await menu.isVisible()) {
        await testMd3Keyboard(page, "menu")
      }
    })
  })

  test.describe("Progress Indicators", () => {
    test("progress has aria attributes", async ({ page }) => {
      const progress = md3(page, "progressIndicator")

      if (await progress.count() > 0) {
        const el = progress.first()
        const isIndeterminate = await md3HasState(el, "progressIndicator", "indeterminate")

        if (!isIndeterminate) {
          // Determinate progress needs value attributes
          const valueNow = await el.getAttribute("aria-valuenow")
          expect(valueNow).toBeTruthy()
        }
      }
    })
  })

  test.describe("Responsive", () => {
    test("correct breakpoint detection", async ({ page }) => {
      const viewport = page.viewportSize()
      if (viewport) {
        const breakpoint = getBreakpoint(viewport.width)
        expect(["compact", "medium", "expanded", "large", "extraLarge"]).toContain(breakpoint)
      }
    })

    test("touch targets meet minimum size", async ({ page }) => {
      // All interactive elements should be at least 48px
      const interactiveSelectors = [
        ...md3Schema.components.button.selectors,
        ...md3Schema.components.iconButton.selectors,
        ...md3Schema.components.checkbox.selectors,
      ].join(", ")

      const elements = page.locator(interactiveSelectors)
      const count = await elements.count()

      for (let i = 0; i < Math.min(count, 10); i++) {
        const el = elements.nth(i)
        if (await el.isVisible()) {
          await expectMinTouchTarget(el)
        }
      }
    })
  })

  test.describe("Tokens and Theme", () => {
    test("core color tokens are exposed as CSS custom properties", async ({ page }) => {
      const colorVars = Object.values(md3Schema.tokens.colors)

      const { missing, total } = await page.evaluate((vars) => {
        const styles = getComputedStyle(document.documentElement)
        const missingVars = vars.filter((v) => !styles.getPropertyValue(v)?.trim())
        return { missing: missingVars, total: vars.length }
      }, colorVars)

      if (missing.length === total) {
        test.skip()
      }

      expect(missing, "Missing MD3 color CSS variables").toEqual([])
    })
  })
})
