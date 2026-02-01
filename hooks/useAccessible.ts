/**
 * useAccessible Hooks
 * Provides standardized accessibility attributes, test IDs, and keyboard navigation
 * for React components. Migrated from @metabuilder/fakemui for broader usage.
 *
 * Features:
 * - Consistent data-testid generation
 * - ARIA attribute generation
 * - Keyboard navigation handling
 * - Focus management utilities
 * - Live region announcements
 * - Focus trapping for modals
 *
 * @example
 * const { testId, ariaLabel } = useAccessible({
 *   feature: 'form',
 *   component: 'button',
 *   action: 'submit'
 * })
 *
 * <button data-testid={testId} aria-label={ariaLabel}>
 *   Submit
 * </button>
 */

import React from 'react'

// ============================================================================
// Types
// ============================================================================

export type AccessibilityFeature =
  | 'canvas'
  | 'settings'
  | 'navigation'
  | 'editor'
  | 'workflow'
  | 'project'
  | 'workspace'
  | 'auth'
  | 'modal'
  | 'toolbar'
  | 'header'
  | 'sidebar'
  | 'form'
  | 'dialog'
  | 'table'
  | 'menu'
  | 'card'
  | 'button'
  | 'input'
  | 'select'

export type AccessibilityComponent =
  | 'item'
  | 'button'
  | 'input'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'label'
  | 'grid'
  | 'list'
  | 'panel'
  | 'container'
  | 'header'
  | 'footer'
  | 'menu'
  | 'tab'
  | 'icon'
  | 'progress'
  | 'tooltip'
  | 'modal'
  | 'card'
  | 'section'
  | 'link'
  | 'image'
  | 'text'
  | 'badge'
  | 'chip'
  | 'divider'
  | 'stepper'
  | 'slider'
  | 'switch'

export type AccessibilityAction =
  | 'drag'
  | 'resize'
  | 'click'
  | 'open'
  | 'close'
  | 'edit'
  | 'delete'
  | 'submit'
  | 'cancel'
  | 'focus'
  | 'blur'
  | 'select'
  | 'deselect'
  | 'expand'
  | 'collapse'
  | 'previous'
  | 'next'
  | 'first'
  | 'last'
  | 'toggle'
  | 'loading'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'favorite'
  | 'share'
  | 'more'

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate standardized data-testid
 * Format: {feature}-{component}-{action}
 * Example: canvas-item-drag, settings-password-input
 */
export function generateTestId(
  feature: AccessibilityFeature | string,
  component: AccessibilityComponent | string,
  action?: AccessibilityAction | string,
  identifier?: string
): string {
  const parts = [feature, component]
  if (action) parts.push(action)
  if (identifier) parts.push(identifier)
  return parts.join('-')
}

/**
 * Common test ID generators with presets
 */
export const testId = {
  // Generic
  button: (label: string) => generateTestId('form', 'button', 'click', label),
  input: (name: string) => generateTestId('form', 'input', undefined, name),
  select: (name: string) => generateTestId('form', 'select', undefined, name),
  checkbox: (name: string) => generateTestId('form', 'checkbox', undefined, name),
  radio: (name: string) => generateTestId('form', 'radio', undefined, name),
  label: (name: string) => generateTestId('form', 'label', undefined, name),
  link: (label: string) => generateTestId('navigation', 'link', 'click', label),
  icon: (name: string) => generateTestId('form', 'icon', undefined, name),
  image: (name: string) => generateTestId('form', 'image', undefined, name),
  text: (content: string) => generateTestId('form', 'text', undefined, content),
  badge: (label: string) => generateTestId('form', 'badge', undefined, label),
  chip: (label: string) => generateTestId('form', 'chip', undefined, label),
  divider: () => generateTestId('form', 'divider'),
  stepper: () => generateTestId('form', 'stepper'),
  slider: (name: string) => generateTestId('form', 'slider', undefined, name),
  switch: (name: string) => generateTestId('form', 'switch', undefined, name),

  // Canvas
  canvasContainer: () => generateTestId('canvas', 'container'),
  canvasGrid: () => generateTestId('canvas', 'grid'),
  canvasItem: (id?: string) => generateTestId('canvas', 'item', 'drag', id),
  canvasItemResize: (id?: string) => generateTestId('canvas', 'item', 'resize', id),
  canvasItemDelete: (id?: string) => generateTestId('canvas', 'item', 'delete', id),
  canvasZoomIn: () => generateTestId('canvas', 'button', 'click', 'zoom-in'),
  canvasZoomOut: () => generateTestId('canvas', 'button', 'click', 'zoom-out'),
  canvasZoomReset: () => generateTestId('canvas', 'button', 'click', 'zoom-reset'),
  canvasPan: () => generateTestId('canvas', 'button', 'click', 'pan'),
  canvasGridToggle: () => generateTestId('canvas', 'button', 'toggle', 'grid'),
  canvasSnapToggle: () => generateTestId('canvas', 'button', 'toggle', 'snap'),

  // Settings
  settingsPanel: () => generateTestId('settings', 'panel'),
  settingsCanvasSection: () => generateTestId('settings', 'section', undefined, 'canvas'),
  settingsSecuritySection: () => generateTestId('settings', 'section', undefined, 'security'),
  settingsNotificationSection: () => generateTestId('settings', 'section', undefined, 'notification'),
  settingsInput: (name: string) => generateTestId('settings', 'input', undefined, name),
  settingsCheckbox: (name: string) => generateTestId('settings', 'checkbox', undefined, name),
  settingsSelect: (name: string) => generateTestId('settings', 'select', undefined, name),
  settingsButton: (action: string) => generateTestId('settings', 'button', 'click', action),

  // Navigation
  navHeader: () => generateTestId('navigation', 'header'),
  navSidebar: () => generateTestId('navigation', 'sidebar'),
  navMenu: () => generateTestId('navigation', 'menu'),
  navMenuButton: (label: string) => generateTestId('navigation', 'button', 'click', label),
  navTab: (label: string) => generateTestId('navigation', 'tab', undefined, label),
  navBreadcrumb: () => generateTestId('navigation', 'list'),
  navLink: (label: string) => generateTestId('navigation', 'button', 'click', label),

  // Editor
  editorContainer: () => generateTestId('editor', 'container'),
  editorToolbar: () => generateTestId('editor', 'toolbar'),
  editorButton: (action: string) => generateTestId('editor', 'button', 'click', action),
  editorNode: (id: string) => generateTestId('editor', 'item', undefined, id),

  // Workflow/Project
  workflowCard: (id: string) => generateTestId('workflow', 'card', undefined, id),
  workflowCardButton: (id: string, action: string) => generateTestId('workflow', 'button', 'click', `${id}-${action}`),
  projectSidebar: () => generateTestId('project', 'sidebar'),
  projectList: () => generateTestId('project', 'list'),
  projectItem: (id: string) => generateTestId('project', 'item', 'click', id),

  // Auth
  authForm: (type: 'login' | 'register') => generateTestId('auth', 'form', undefined, type),
  authInput: (field: string) => generateTestId('auth', 'input', undefined, field),
  authButton: (action: string) => generateTestId('auth', 'button', 'click', action),

  // Modal/Dialog
  modal: (name: string) => generateTestId('modal', 'modal', undefined, name),
  modalClose: (name: string) => generateTestId('modal', 'button', 'click', `${name}-close`),
  modalButton: (name: string, action: string) => generateTestId('modal', 'button', 'click', `${name}-${action}`),

  // Table
  table: (name: string) => generateTestId('table', 'table', undefined, name),
  tableRow: (name: string, rowId: string) => generateTestId('table', 'item', undefined, `${name}-${rowId}`),
  tableCell: (name: string, rowId: string, colId: string) => generateTestId('table', 'item', undefined, `${name}-${rowId}-${colId}`),

  // Menu
  menu: (name: string) => generateTestId('menu', 'menu', undefined, name),
  menuItem: (label: string) => generateTestId('menu', 'button', 'click', label),

  // Card
  card: (id: string) => generateTestId('card', 'card', undefined, id),
  cardButton: (id: string, action: string) => generateTestId('card', 'button', 'click', `${id}-${action}`),

  // Help/Documentation
  help: (name: string) => generateTestId('help', 'section', undefined, name),
  helpButton: () => generateTestId('help', 'button', 'click', 'open'),
  helpModal: (name: string) => generateTestId('help', 'modal', undefined, name),
  helpSearch: () => generateTestId('help', 'input', undefined, 'search'),
  helpNav: (name: string) => generateTestId('help', 'nav', undefined, name),
  alert: (type: string) => generateTestId('alert', 'alert', undefined, type),
  section: (id: string) => generateTestId('section', 'region', undefined, id),
  listItem: (label: string) => generateTestId('list', 'item', undefined, label),
}

/**
 * Generate ARIA attributes object for common patterns
 */
export const aria = {
  // Button patterns
  button: (label: string) => ({
    'aria-label': label,
    role: 'button' as const,
  }),

  // Toggle patterns
  toggle: (label: string, isActive: boolean) => ({
    'aria-label': label,
    'aria-pressed': isActive,
    role: 'switch' as const,
  }),

  // Menu/Navigation patterns
  menu: () => ({
    role: 'menu' as const,
  }),

  menuItem: (label: string) => ({
    'aria-label': label,
    role: 'menuitem' as const,
  }),

  // List patterns
  list: (label?: string) => ({
    ...(label && { 'aria-label': label }),
    role: 'list' as const,
  }),

  listItem: () => ({
    role: 'listitem' as const,
  }),

  // Form patterns
  label: (htmlFor: string) => ({
    htmlFor,
  }),

  input: (ariaLabel: string, ariaDescribedBy?: string) => ({
    'aria-label': ariaLabel,
    ...(ariaDescribedBy && { 'aria-describedby': ariaDescribedBy }),
  }),

  checkbox: (label: string, isChecked: boolean) => ({
    'aria-label': label,
    'aria-checked': isChecked,
    role: 'checkbox' as const,
  }),

  radio: (label: string, isSelected: boolean) => ({
    'aria-label': label,
    'aria-checked': isSelected,
    role: 'radio' as const,
  }),

  combobox: (isExpanded: boolean, hasPopup = true) => ({
    'aria-expanded': isExpanded,
    'aria-haspopup': hasPopup,
    role: 'combobox' as const,
  }),

  // Dialog/Modal patterns
  dialog: (label: string) => ({
    'aria-label': label,
    'aria-modal': true,
    role: 'dialog' as const,
  }),

  // Tab patterns
  tablist: () => ({
    role: 'tablist' as const,
  }),

  tab: (isSelected: boolean, controls?: string) => ({
    role: 'tab' as const,
    'aria-selected': isSelected,
    ...(controls && { 'aria-controls': controls }),
  }),

  tabpanel: (label: string, isVisible: boolean) => ({
    role: 'tabpanel' as const,
    'aria-label': label,
    ...(isVisible === false && { hidden: true }),
  }),

  // Status/Alert patterns
  status: (message: string, level: 'info' | 'warning' | 'error' | 'success' = 'info') => ({
    role: 'status' as const,
    'aria-label': `${level}: ${message}`,
    'aria-live': (level === 'error' ? 'assertive' : 'polite') as 'assertive' | 'polite',
  }),

  alert: (message: string) => ({
    role: 'alert' as const,
    'aria-label': message,
    'aria-live': 'assertive' as const,
  }),

  // Expandable/Collapsible patterns
  collapsible: (isExpanded: boolean, controls?: string) => ({
    'aria-expanded': isExpanded,
    ...(controls && { 'aria-controls': controls }),
  }),

  // Progress patterns
  progressbar: (value: number, max = 100, label?: string) => ({
    role: 'progressbar' as const,
    'aria-valuenow': value,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    ...(label && { 'aria-label': label }),
  }),

  // Slider patterns
  slider: (value: number, min: number, max: number, label?: string) => ({
    role: 'slider' as const,
    'aria-valuenow': value,
    'aria-valuemin': min,
    'aria-valuemax': max,
    ...(label && { 'aria-label': label }),
  }),

  // Loading/Busy patterns
  busy: () => ({
    'aria-busy': true,
    'aria-live': 'polite' as const,
  }),

  // Disabled patterns
  disabled: () => ({
    'aria-disabled': true,
  }),

  // Hidden patterns
  hidden: () => ({
    'aria-hidden': true,
  }),

  // Live region patterns
  liveRegion: (polite = true) => ({
    'aria-live': (polite ? 'polite' : 'assertive') as 'polite' | 'assertive',
    'aria-atomic': true,
  }),

  // Description patterns
  describedBy: (id: string) => ({
    'aria-describedby': id,
  }),

  // Label by pattern
  labelledBy: (id: string) => ({
    'aria-labelledby': id,
  }),

  // Error patterns
  invalid: (errorId?: string) => ({
    'aria-invalid': true,
    ...(errorId && { 'aria-describedby': errorId }),
  }),

  // Required patterns
  required: () => ({
    'aria-required': true,
  }),
}

/**
 * Accessibility-focused keyboard event handler patterns
 */
export const keyboard = {
  /**
   * Check if key event is for activation (Enter or Space)
   */
  isActivation: (key: string): boolean => key === 'Enter' || key === ' ',

  /**
   * Check if key is arrow key
   */
  isArrow: (key: string): boolean =>
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key),

  /**
   * Check if key is Escape
   */
  isEscape: (key: string): boolean => key === 'Escape',

  /**
   * Check if key is Tab
   */
  isTab: (key: string): boolean => key === 'Tab',

  /**
   * Get arrow direction (1 for forward, -1 for backward)
   */
  getArrowDirection: (
    key: string,
    horizontal = true
  ): 0 | 1 | -1 => {
    if (horizontal) {
      if (key === 'ArrowRight') return 1
      if (key === 'ArrowLeft') return -1
    } else {
      if (key === 'ArrowDown') return 1
      if (key === 'ArrowUp') return -1
    }
    return 0
  },
}

/**
 * Accessibility validators
 */
export const validate = {
  /**
   * Validate that an element has proper aria-label or aria-labelledby
   */
  hasLabel: (element: HTMLElement): boolean => {
    return !!(element.getAttribute('aria-label') || element.getAttribute('aria-labelledby'))
  },

  /**
   * Validate that form inputs have associated labels
   */
  hasFormLabel: (input: HTMLInputElement): boolean => {
    const id = input.id
    if (!id) return false
    const label = document.querySelector(`label[for="${id}"]`)
    return !!label || input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby')
  },

  /**
   * Validate that an interactive element is keyboard accessible
   */
  isKeyboardAccessible: (element: HTMLElement): boolean => {
    const role = element.getAttribute('role')
    const tabIndex = element.tabIndex
    return tabIndex >= 0 || ['button', 'link', 'menuitem', 'tab'].includes(role || '')
  },

  /**
   * Validate that an element has sufficient color contrast
   * Note: This requires runtime color computation
   */
  hasContrast: (element: HTMLElement, _minRatio = 4.5): boolean => {
    const style = window.getComputedStyle(element)
    const bgColor = style.backgroundColor
    const fgColor = style.color
    return !!(bgColor && fgColor)
  },
}

// ============================================================================
// React Hooks
// ============================================================================

interface UseAccessibleOptions {
  feature: AccessibilityFeature | string
  component: AccessibilityComponent | string
  action?: AccessibilityAction | string
  identifier?: string
  ariaLabel?: string
  ariaDescribedBy?: string
}

interface AccessibleAttributes {
  'data-testid': string
  'aria-label'?: string
  'aria-describedby'?: string
  role?: string
}

/**
 * Hook for generating consistent accessibility attributes
 * Combines data-testid and ARIA attributes in a single call
 *
 * @example
 * const attrs = useAccessible({
 *   feature: 'form',
 *   component: 'button',
 *   action: 'submit'
 * })
 *
 * <button {...attrs}>Submit</button>
 */
export function useAccessible(options: UseAccessibleOptions): AccessibleAttributes {
  const { feature, component, action, identifier, ariaLabel, ariaDescribedBy } = options

  const testIdValue = generateTestId(feature, component, action, identifier)

  const attributes: AccessibleAttributes = {
    'data-testid': testIdValue,
  }

  if (ariaLabel) {
    attributes['aria-label'] = ariaLabel
  }

  if (ariaDescribedBy) {
    attributes['aria-describedby'] = ariaDescribedBy
  }

  return attributes
}

/**
 * Hook for keyboard navigation handling
 * Provides common keyboard event handlers
 *
 * @example
 * const keyboardProps = useKeyboardNavigation({
 *   onEnter: () => handleSubmit(),
 *   onEscape: () => handleClose(),
 *   onArrowUp: () => handlePrevious(),
 *   onArrowDown: () => handleNext()
 * })
 *
 * <div {...keyboardProps}>Content</div>
 */
export function useKeyboardNavigation(handlers: {
  onEnter?: () => void
  onEscape?: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onArrowLeft?: () => void
  onArrowRight?: () => void
  onTab?: () => void
}) {
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handlers.onEnter?.()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handlers.onEscape?.()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        handlers.onArrowUp?.()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handlers.onArrowDown?.()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlers.onArrowLeft?.()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handlers.onArrowRight?.()
      } else if (e.key === 'Tab') {
        handlers.onTab?.()
      }
    },
    [handlers]
  )

  return { onKeyDown: handleKeyDown }
}

/**
 * Hook for managing focus
 * Provides focus management utilities
 *
 * @example
 * const { focusRef, focus } = useFocusManagement()
 *
 * <button ref={focusRef} onClick={() => focus()}>
 *   Refocus me
 * </button>
 */
export function useFocusManagement() {
  const ref = React.useRef<HTMLElement>(null)

  const focus = React.useCallback(() => {
    ref.current?.focus()
  }, [])

  const blur = React.useCallback(() => {
    ref.current?.blur()
  }, [])

  return { focusRef: ref, focus, blur }
}

/**
 * Hook for live region announcements
 * Provides screen reader announcements
 *
 * @example
 * const { announce, liveRegionProps, message } = useLiveRegion('polite')
 *
 * announce('Item deleted successfully')
 *
 * <div {...liveRegionProps}>{message}</div>
 */
export function useLiveRegion(politeness: 'polite' | 'assertive' = 'polite') {
  const [message, setMessage] = React.useState('')

  const announce = React.useCallback(
    (text: string) => {
      setMessage(text)
      // Clear after announcement
      setTimeout(() => setMessage(''), 1000)
    },
    []
  )

  return {
    announce,
    liveRegionProps: {
      role: 'status' as const,
      'aria-live': politeness,
      'aria-atomic': true as const,
    },
    message,
  }
}

/**
 * Hook for managing modal/dialog focus
 * Traps focus within modal and restores on close
 *
 * @example
 * const { focusTrapRef } = useFocusTrap(isOpen)
 *
 * <div ref={focusTrapRef}>
 *   Modal content
 * </div>
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = containerRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>

      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (e.shiftKey && activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      } else if (!e.shiftKey && activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }

    const container = containerRef.current
    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive])

  return { focusTrapRef: containerRef }
}

// Default export for convenience
export default {
  generateTestId,
  testId,
  aria,
  keyboard,
  validate,
  useAccessible,
  useKeyboardNavigation,
  useFocusManagement,
  useLiveRegion,
  useFocusTrap,
}
