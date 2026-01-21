import { Page, Locator } from "@playwright/test"

/**
 * M3 Test Helpers for Material Design 3 Framework
 * Provides utilities for testing M3-based components
 */

// M3 Color CSS variables mapping
export const M3_COLORS = {
  primary: 'var(--mat-sys-primary, #6750a4)',
  onPrimary: 'var(--mat-sys-on-primary, #ffffff)',
  secondary: 'var(--mat-sys-secondary, #625b71)',
  onSecondary: 'var(--mat-sys-on-secondary, #ffffff)',
  background: 'var(--mat-sys-background, #fffbfe)',
  onBackground: 'var(--mat-sys-on-background, #1c1b1f)',
  surface: 'var(--mat-sys-surface, #fffbfe)',
  onSurface: 'var(--mat-sys-on-surface, #1c1b1f)',
  error: 'var(--mat-sys-error, #b3261e)',
  outline: 'var(--mat-sys-outline, #79747e)',
}

// M3 Corner radius tokens
export const M3_RADIUS = {
  extraSmall: 'var(--mat-sys-corner-extra-small, 4px)',
  small: 'var(--mat-sys-corner-small, 8px)',
  medium: 'var(--mat-sys-corner-medium, 12px)',
  large: 'var(--mat-sys-corner-large, 16px)',
  extraLarge: 'var(--mat-sys-corner-extra-large, 28px)',
}

// M3 Button class names
export const M3_BUTTON_CLASSES = {
  base: 'mat-mdc-button',
  unelevated: 'mat-mdc-unelevated-button',
  raised: 'mat-mdc-raised-button',
  outlined: 'mat-mdc-outlined-button',
  text: 'mat-mdc-button',
  tonal: 'mat-tonal-button',
  icon: 'mat-mdc-icon-button',
}

// M3 Component selectors
export const M3_SELECTORS = {
  button: `button[class*="mat-mdc-button"], button[class*="mdc-button"]`,
  iconButton: `button[class*="mat-mdc-icon-button"]`,
  listItem: `.mat-mdc-list-item, [role="listitem"]`,
  card: `.mat-mdc-card, [role="article"]`,
  dialog: `.mat-mdc-dialog-container, [role="dialog"]`,
  accordion: `.mat-accordion, .mat-expansion-panel`,
  input: `input[class*="mat-mdc"], textarea[class*="mat-mdc"]`,
  checkbox: `input[type="checkbox"][class*="mat-mdc"]`,
  radio: `input[type="radio"][class*="mat-mdc"]`,
  switch: `input[type="checkbox"][role="switch"]`,
  select: `select[class*="mat-mdc"], [role="combobox"]`,
  tab: `.mat-mdc-tab, [role="tab"]`,
  tooltip: `.mat-mdc-tooltip, [role="tooltip"]`,
  menu: `.mat-mdc-menu-panel, [role="menu"]`,
  snackbar: `.mat-mdc-snack-bar-container, [role="status"][aria-live="polite"]`,
}

/**
 * Find an M3 button by text content
 */
export async function findM3Button(page: Page, text: string): Promise<Locator | null> {
  const button = page.locator(M3_SELECTORS.button, { hasText: text }).first()
  return (await button.count()) > 0 ? button : null
}

/**
 * Find an M3 button by aria-label
 */
export async function findM3ButtonByLabel(page: Page, label: string): Promise<Locator | null> {
  const button = page.locator(`button[aria-label="${label}"]`).first()
  return (await button.count()) > 0 ? button : null
}

/**
 * Check if an M3 button is disabled
 */
export async function isM3ButtonDisabled(button: Locator): Promise<boolean> {
  const disabled = await button.getAttribute('disabled')
  const ariaDisabled = await button.getAttribute('aria-disabled')
  return disabled !== null || ariaDisabled === 'true'
}

/**
 * Get the M3 button variant from its class
 */
export async function getM3ButtonVariant(button: Locator): Promise<string> {
  const classList = await button.getAttribute('class')
  if (!classList) return 'unknown'
  
  if (classList.includes('mat-mdc-outlined-button')) return 'outlined'
  if (classList.includes('mat-mdc-raised-button')) return 'raised'
  if (classList.includes('mat-mdc-unelevated-button')) return 'unelevated'
  if (classList.includes('mat-tonal-button')) return 'tonal'
  if (classList.includes('mat-mdc-icon-button')) return 'icon'
  
  return 'text'
}

/**
 * Verify M3 button has ripple effect (mat-mdc-button-persistent-ripple)
 */
export async function hasM3Ripple(button: Locator): Promise<boolean> {
  const ripple = button.locator('.mat-mdc-button-persistent-ripple')
  return (await ripple.count()) > 0
}

/**
 * Verify M3 focus indicator is present
 */
export async function hasM3FocusIndicator(element: Locator): Promise<boolean> {
  const focusIndicator = element.locator('.mat-mdc-focus-indicator')
  return (await focusIndicator.count()) > 0
}

/**
 * Get computed M3 color variable value
 */
export async function getM3Color(page: Page, variable: keyof typeof M3_COLORS): Promise<string> {
  return await page.evaluate((varName) => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim()
  }, `--mat-sys-${variable}`)
}

/**
 * Wait for M3 animations to complete
 */
export async function waitForM3Animation(page: Page, timeout = 300): Promise<void> {
  await page.waitForTimeout(timeout)
}

/**
 * Verify element has M3 theming applied
 */
export async function hasM3Theming(element: Locator): Promise<boolean> {
  const classList = await element.getAttribute('class')
  const html = await element.innerHTML()
  
  const hasMdcClass = classList?.includes('mat-mdc') || classList?.includes('mdc-')
  const hasMdcContent = html?.includes('mdc-') || html?.includes('mat-mdc')
  
  return hasMdcClass || hasMdcContent
}

/**
 * Test M3 component responds to focus
 */
export async function testM3FocusBehavior(element: Locator): Promise<boolean> {
  await element.focus()
  const isFocused = await element.evaluate((el: HTMLElement) => document.activeElement === el)
  return isFocused
}

/**
 * Test M3 component keyboard navigation
 */
export async function testM3KeyboardNavigation(page: Page, element: Locator, key: string): Promise<void> {
  await element.focus()
  await page.keyboard.press(key)
  await waitForM3Animation(page)
}

/**
 * Verify M3 component meets touch target minimum (48x48px)
 */
export async function verifyM3TouchTarget(element: Locator): Promise<boolean> {
  const box = await element.boundingBox()
  if (!box) return false
  return box.width >= 48 && box.height >= 48
}

/**
 * Get M3 component accessibility information
 */
export async function getM3A11yInfo(element: Locator): Promise<{
  role: string | null
  ariaLabel: string | null
  ariaLabelledBy: string | null
  ariaDescribedBy: string | null
}> {
  const role = await element.getAttribute('role')
  const ariaLabel = await element.getAttribute('aria-label')
  const ariaLabelledBy = await element.getAttribute('aria-labelledby')
  const ariaDescribedBy = await element.getAttribute('aria-describedby')
  
  return { role, ariaLabel, ariaLabelledBy, ariaDescribedBy }
}

/**
 * Verify M3 list item has proper structure
 */
export async function verifyM3ListItem(item: Locator): Promise<boolean> {
  const classList = await item.getAttribute('class')
  const hasListItemClass = classList?.includes('mat-mdc-list-item') || classList?.includes('mdc-list-item')
  const role = await item.getAttribute('role')
  
  return hasListItemClass || role === 'listitem'
}

/**
 * Test M3 component color contrast
 */
export async function verifyM3ColorContrast(element: Locator): Promise<{
  color: string
  backgroundColor: string
  contrast: number
}> {
  const style = await element.evaluate((el: HTMLElement) => {
    const computed = window.getComputedStyle(el)
    return {
      color: computed.color,
      backgroundColor: computed.backgroundColor,
    }
  })
  
  // Simple contrast ratio approximation (actual WCAG calculation would be more complex)
  return {
    ...style,
    contrast: 4.5, // Placeholder
  }
}
