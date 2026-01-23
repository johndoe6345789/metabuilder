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
  modalClose: (name: string) => `modal-close-${name}`,
  card: (name: string) => `card-${name}`,
  tab: (name: string) => `tab-${name}`,
  alert: (name: string) => `alert-${name}`,
  text: (name: string) => `text-${name}`,
  link: (name: string) => `link-${name}`,
  section: (name: string) => `section-${name}`,
  helpNav: (name: string) => `help-nav-${name}`,
  listItem: (name: string) => `list-item-${name}`,
  navHeader: () => 'nav-header',
  navMenuButton: (name: string) => `nav-menu-button-${name}`,
  navSidebar: () => 'nav-sidebar',
  navTab: (name: string) => `nav-tab-${name}`,
  canvasContainer: () => 'canvas-container',
  canvasGrid: () => 'canvas-grid',
  canvasZoomIn: () => 'canvas-zoom-in',
  canvasZoomOut: () => 'canvas-zoom-out',
  canvasZoomReset: () => 'canvas-zoom-reset',
  projectItem: (id: string) => `project-item-${id}`,
  projectSidebar: () => 'project-sidebar',
  settingsButton: (name: string) => `settings-button-${name}`,
  settingsPanel: () => 'settings-panel',
  settingsCanvasSection: () => 'settings-canvas-section',
  settingsNotificationSection: () => 'settings-notification-section',
  settingsSecuritySection: () => 'settings-security-section',
  workflowCard: (id: string) => `workflow-card-${id}`,
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
