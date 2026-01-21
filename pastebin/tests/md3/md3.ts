import { Page, Locator, expect } from "@playwright/test"
import schema from "./md3-schema.json"

type ComponentName = keyof typeof schema.components
type Component = (typeof schema.components)[ComponentName]

/** Get a locator for any MD3 component */
export function md3(page: Page, component: ComponentName, options?: { label?: string; nth?: number }): Locator {
  const def = schema.components[component] as Component

  // Prefer role + label for accessibility
  if ("role" in def && def.role && options?.label) {
    return page.getByRole(def.role as "code" | "button" | "textbox" | "checkbox" | "radio" | "switch" | "dialog" | "status" | "menu" | "navigation" | "tablist" | "list" | "separator" | "progressbar" | "combobox" | "listbox" | "option" | "group" | "img" | "banner" | "contentinfo" | "complementary" | "region" | "log" | "marquee" | "alert" | "alertdialog" | "application" | "article" | "document" | "feed" | "main" | "heading" | "tooltip" | "link" | "searchbox" | "slider" | "spinbutton" | "scrollbar" | "table" | "rowgroup" | "row" | "columnheader" | "rowheader" | "cell" | "gridcell" | "form" | "presentation" | "none" | "tree" | "treegrid" | "treeitem" | "math" | "menuitem" | "menuitemcheckbox" | "menuitemradio" | "tab" | "tabpanel" | "definition" | "directory" | "subscript" | "superscript", { name: options.label })
  }

  // Fall back to selectors
  const selector = def.selectors.join(", ")
  const locator = page.locator(selector)

  return options?.nth !== undefined ? locator.nth(options.nth) : locator
}

/** Get a part within an MD3 component */
export function md3Part(component: Locator, componentType: ComponentName, part: string): Locator {
  const def = schema.components[componentType] as Component
  if ("parts" in def && def.parts) {
    const partSelector = (def.parts as Record<string, string>)[part]
    if (partSelector) return component.locator(partSelector)
  }
  throw new Error(`Part "${part}" not found in ${componentType}`)
}

/** Check if component is in a specific state */
export async function md3HasState(component: Locator, componentType: ComponentName, state: string): Promise<boolean> {
  const def = schema.components[componentType] as Component
  if ("states" in def && def.states) {
    const stateSelector = (def.states as Record<string, string>)[state]
    if (stateSelector) {
      return await component.locator(`:scope${stateSelector}`).count() > 0 ||
             await component.filter({ has: component.page().locator(stateSelector) }).count() > 0
    }
  }
  return false
}

/** Assert component exists and is visible */
export async function expectMd3Visible(page: Page, component: ComponentName, options?: { label?: string }) {
  await expect(md3(page, component, options).first()).toBeVisible()
}

/** Assert component has proper a11y attributes */
export async function expectMd3Accessible(page: Page, component: ComponentName, options?: { label?: string }) {
  const def = schema.components[component] as Component
  const el = md3(page, component, options).first()

  if ("a11y" in def && def.a11y) {
    const a11y = def.a11y as Record<string, unknown>

    if (a11y.requiresAriaLabel) {
      const label = await el.getAttribute("aria-label") || await el.getAttribute("aria-labelledby")
      expect(label, `${component} requires aria-label`).toBeTruthy()
    }

    if (a11y.requiresAccessibleName) {
      const name = await el.getAttribute("aria-label") ||
                   await el.getAttribute("title") ||
                   await el.textContent()
      expect(name, `${component} requires accessible name`).toBeTruthy()
    }
  }

  if ("role" in def && def.role) {
    const role = await el.getAttribute("role")
    // Role can be implicit or explicit
    expect(role === def.role || role === null).toBeTruthy()
  }
}

/** Test keyboard navigation for a component */
export async function testMd3Keyboard(page: Page, component: ComponentName) {
  const def = schema.components[component] as Component

  if ("a11y" in def && def.a11y && "keyboardNavigation" in def.a11y) {
    const keys = def.a11y.keyboardNavigation as string[]
    const el = md3(page, component).first()
    await el.focus()

    for (const key of keys) {
      await page.keyboard.press(key)
      // Small delay for state changes
      await page.waitForTimeout(50)
    }
  }
}

/** Wait for ripple animation to complete */
export async function waitForRipple(page: Page, timeout = 300) {
  await page.waitForTimeout(timeout)
}

/** Get all components of a type on the page */
export function md3All(page: Page, component: ComponentName): Locator {
  const def = schema.components[component] as Component
  return page.locator(def.selectors.join(", "))
}

/** Check component against MD3 breakpoints */
export function getBreakpoint(width: number): string {
  const bp = schema.breakpoints
  if (width <= bp.compact.max) return "compact"
  if (width >= bp.medium.min && width <= bp.medium.max) return "medium"
  if (width >= bp.expanded.min && width <= bp.expanded.max) return "expanded"
  if (width >= bp.large.min && width <= bp.large.max) return "large"
  return "extraLarge"
}

/** Get MD3 design token value */
export function getToken(category: "colors" | "elevation" | "shape", token: string): string {
  return (schema.tokens[category] as Record<string, string>)[token]
}

/** Get motion duration in ms */
export function getMotionDuration(duration: keyof typeof schema.tokens.motion.duration): number {
  return parseInt(schema.tokens.motion.duration[duration])
}

/** Assert touch target meets MD3 minimum (48px) */
export async function expectMinTouchTarget(locator: Locator) {
  const box = await locator.boundingBox()
  expect(box?.width, "Touch target width").toBeGreaterThanOrEqual(schema.a11y.minTouchTarget)
  expect(box?.height, "Touch target height").toBeGreaterThanOrEqual(schema.a11y.minTouchTarget)
}

// Re-export schema for direct access
export { schema as md3Schema }
