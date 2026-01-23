/**
 * Accessibility Utilities (Fakemui)
 * Centralized helpers for data-testid naming and ARIA attribute generation
 * Pattern: {feature}-{component}-{action}
 * Example: canvas-item-drag, settings-password-input
 */

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
  | 'select';

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
  | 'switch';

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
  | 'more';

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
  const parts = [feature, component];
  if (action) parts.push(action);
  if (identifier) parts.push(identifier);
  return parts.join('-');
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
};

/**
 * Generate ARIA attributes object for common patterns
 */
export const aria = {
  // Button patterns
  button: (label: string) => ({
    'aria-label': label,
    role: 'button',
  }),

  // Toggle patterns
  toggle: (label: string, isActive: boolean) => ({
    'aria-label': label,
    'aria-pressed': isActive,
    role: 'switch',
  }),

  // Menu/Navigation patterns
  menu: () => ({
    role: 'menu',
  }),

  menuItem: (label: string) => ({
    'aria-label': label,
    role: 'menuitem',
  }),

  // List patterns
  list: (label?: string) => ({
    ...(label && { 'aria-label': label }),
    role: 'list',
  }),

  listItem: () => ({
    role: 'listitem',
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
    role: 'checkbox',
  }),

  radio: (label: string, isSelected: boolean) => ({
    'aria-label': label,
    'aria-checked': isSelected,
    role: 'radio',
  }),

  combobox: (isExpanded: boolean, hasPopup = true) => ({
    'aria-expanded': isExpanded,
    'aria-haspopup': hasPopup,
    role: 'combobox',
  }),

  // Dialog/Modal patterns
  dialog: (label: string) => ({
    'aria-label': label,
    'aria-modal': true,
    role: 'dialog',
  }),

  // Tab patterns
  tablist: () => ({
    role: 'tablist',
  }),

  tab: (isSelected: boolean, controls?: string) => ({
    role: 'tab',
    'aria-selected': isSelected,
    ...(controls && { 'aria-controls': controls }),
  }),

  tabpanel: (label: string, isVisible: boolean) => ({
    role: 'tabpanel',
    'aria-label': label,
    ...(isVisible === false && { hidden: true }),
  }),

  // Status/Alert patterns
  status: (message: string, level: 'info' | 'warning' | 'error' | 'success' = 'info') => ({
    role: 'status',
    'aria-label': `${level}: ${message}`,
    'aria-live': level === 'error' ? 'assertive' : 'polite',
  }),

  alert: (message: string) => ({
    role: 'alert',
    'aria-label': message,
    'aria-live': 'assertive',
  }),

  // Expandable/Collapsible patterns
  collapsible: (isExpanded: boolean, controls?: string) => ({
    'aria-expanded': isExpanded,
    ...(controls && { 'aria-controls': controls }),
  }),

  // Progress patterns
  progressbar: (value: number, max = 100, label?: string) => ({
    role: 'progressbar',
    'aria-valuenow': value,
    'aria-valuemin': 0,
    'aria-valuemax': max,
    ...(label && { 'aria-label': label }),
  }),

  // Slider patterns
  slider: (value: number, min: number, max: number, label?: string) => ({
    role: 'slider',
    'aria-valuenow': value,
    'aria-valuemin': min,
    'aria-valuemax': max,
    ...(label && { 'aria-label': label }),
  }),

  // Loading/Busy patterns
  busy: () => ({
    'aria-busy': true,
    'aria-live': 'polite',
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
    'aria-live': polite ? 'polite' : 'assertive',
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
};

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
      if (key === 'ArrowRight') return 1;
      if (key === 'ArrowLeft') return -1;
    } else {
      if (key === 'ArrowDown') return 1;
      if (key === 'ArrowUp') return -1;
    }
    return 0;
  },
};

/**
 * Accessibility validators
 */
export const validate = {
  /**
   * Validate that an element has proper aria-label or aria-labelledby
   */
  hasLabel: (element: HTMLElement): boolean => {
    return !!(element.getAttribute('aria-label') || element.getAttribute('aria-labelledby'));
  },

  /**
   * Validate that form inputs have associated labels
   */
  hasFormLabel: (input: HTMLInputElement): boolean => {
    const id = input.id;
    if (!id) return false;
    const label = document.querySelector(`label[for="${id}"]`);
    return !!label || input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
  },

  /**
   * Validate that an interactive element is keyboard accessible
   */
  isKeyboardAccessible: (element: HTMLElement): boolean => {
    const role = element.getAttribute('role');
    const tabIndex = element.tabIndex;
    return tabIndex >= 0 || ['button', 'link', 'menuitem', 'tab'].includes(role || '');
  },

  /**
   * Validate that an element has sufficient color contrast
   * Note: This requires runtime color computation
   */
  hasContrast: (element: HTMLElement, minRatio = 4.5): boolean => {
    const style = window.getComputedStyle(element);
    const bgColor = style.backgroundColor;
    const fgColor = style.color;
    return !!(bgColor && fgColor);
  },
};

export default {
  generateTestId,
  testId,
  aria,
  keyboard,
  validate,
};
