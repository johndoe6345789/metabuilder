/**
 * Accessibility Utilities for WorkflowUI
 * Local implementations for generating test IDs and accessibility attributes
 */

// Test ID utilities
export const testId = {
  navBreadcrumb: () => 'nav-breadcrumb',
  navLink: (name: string) => `nav-link-${name}`,
  button: (name: string) => `button-${name}`,
  input: (name: string) => `input-${name}`,
  checkbox: (name: string) => `checkbox-${name}`,
  select: (name: string) => `select-${name}`,
  modal: (name: string) => `modal-${name}`,
  card: (name: string) => `card-${name}`,
  tab: (name: string) => `tab-${name}`,
}

// Generate test ID helper
export const generateTestId = (prefix: string, name: string) => `${prefix}-${name}`

// ARIA utilities
export const aria = {
  label: (text: string) => ({ 'aria-label': text }),
  labelledby: (id: string) => ({ 'aria-labelledby': id }),
  describedby: (id: string) => ({ 'aria-describedby': id }),
  expanded: (expanded: boolean) => ({ 'aria-expanded': expanded }),
  selected: (selected: boolean) => ({ 'aria-selected': selected }),
  hidden: (hidden: boolean) => ({ 'aria-hidden': hidden }),
  live: (polite: 'polite' | 'assertive' = 'polite') => ({ 'aria-live': polite }),
  role: (role: string) => ({ role }),
}

// Keyboard utilities
export const keyboard = {
  enter: 'Enter',
  space: ' ',
  escape: 'Escape',
  arrowUp: 'ArrowUp',
  arrowDown: 'ArrowDown',
  arrowLeft: 'ArrowLeft',
  arrowRight: 'ArrowRight',
  tab: 'Tab',
}

// Validation utilities
export const validate = {
  email: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  password: (password: string) => password.length >= 8,
  url: (url: string) => /^https?:\/\/.+/.test(url),
  required: (value: any) => value != null && value !== '',
}

// Type exports for compatibility
export type AccessibilityFeature = 'screen-reader' | 'keyboard-nav' | 'high-contrast'
export type AccessibilityComponent = 'button' | 'input' | 'modal' | 'tab' | 'menu'
export type AccessibilityAction = 'click' | 'focus' | 'blur' | 'keypress'
