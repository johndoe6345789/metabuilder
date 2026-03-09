/**
 * Accessibility Utilities for Settings Components
 * Local implementations for generating test IDs and accessibility attributes
 */

// Test ID utilities
export const testId = {
  modal: (name: string) => `modal-${name}`,
  modalClose: (name: string) => `modal-close-${name}`,
  navTab: (name: string) => `nav-tab-${name}`,
  settingsButton: (name: string) => `settings-button-${name}`,
  settingsPanel: () => 'settings-panel',
  settingsCanvasSection: () => 'settings-canvas-section',
  settingsNotificationSection: () => 'settings-notification-section',
  settingsSecuritySection: () => 'settings-security-section',
}

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
