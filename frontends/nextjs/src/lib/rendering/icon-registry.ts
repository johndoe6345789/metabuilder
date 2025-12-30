/**
 * Icon Registry for mapping Lua icon names to fakemui icons
 * This allows Lua packages to reference icons by name without importing them directly
 */

import * as FakeMuiIcons from '@/fakemui/icons'

export type IconName = keyof typeof FakeMuiIcons

/**
 * Common icon name aliases for backwards compatibility and convenience
 * Maps common icon names (lowercase, kebab-case, etc.) to actual fakemui icon names
 */
export const iconNameAliases: Record<string, IconName> = {
  // Common aliases (lowercase)
  'plus': 'Plus',
  'add': 'Add',
  'trash': 'Trash',
  'delete': 'Delete',
  'edit': 'Edit',
  'pencil': 'Pencil',
  'save': 'Save',
  'check': 'Check',
  'close': 'Close',
  'x': 'X',
  'search': 'Search',
  'filter': 'Filter',
  'settings': 'Settings',
  'user': 'User',
  'users': 'Users',
  'home': 'Home',
  'menu': 'Menu',
  'more-vertical': 'MoreVertical',
  'more-horizontal': 'MoreHorizontal',
  'chevron-up': 'ChevronUp',
  'chevron-down': 'ChevronDown',
  'chevron-left': 'ChevronLeft',
  'chevron-right': 'ChevronRight',
  'arrow-up': 'ArrowUp',
  'arrow-down': 'ArrowDown',
  'arrow-left': 'ArrowLeft',
  'arrow-right': 'ArrowRight',
  'calendar': 'Calendar',
  'clock': 'Clock',
  'mail': 'Mail',
  'bell': 'Bell',
  'star': 'Star',
  'heart': 'Heart',
  'share': 'Share',
  'download': 'Download',
  'upload': 'Upload',
  'refresh': 'Refresh',
  'loading': 'Loader',
  'loader': 'Loader',
  'spinner': 'Loader',
  'info': 'Info',
  'warning': 'Warning',
  'error': 'CircleX',
  'success': 'CheckCircle',
  'eye': 'Eye',
  'eye-slash': 'EyeSlash',
  'lock': 'Lock',
  'unlock': 'LockOpen',
  'key': 'Key',
  'shield': 'Shield',
  'database': 'Database',
  'cloud': 'Cloud',
  'code': 'Code',
  'terminal': 'Terminal',
  'grid': 'Grid',
  'list': 'List',
  'table': 'Table',
  'image': 'Image',
  'video': 'Video',
  'file': 'File',
  'folder': 'Folder',
  'link': 'Link',
  'external-link': 'ExternalLink',
  'play': 'Play',
  'pause': 'Pause',
  'stop': 'Stop',
  'expand': 'Expand',
  'collapse': 'Collapse',
  'maximize': 'Maximize',
  'minimize': 'Minimize',
  'zoom-in': 'ZoomIn',
  'zoom-out': 'ZoomOut',

  // Data table specific
  'sort-ascending': 'SortAscending',
  'sort-descending': 'SortDescending',
  'sort': 'Sort',
  'filter-clear': 'FilterClear',
  'filter-off': 'FilterOff',
  'csv': 'Csv',
  'json': 'Json',

  // Workflow icons
  'workflow': 'Workflow',
  'git-branch': 'GitBranch',
  'call-split': 'CallSplit',

  // Form validation
  'check-circle': 'CheckCircle',
  'alert-circle': 'AlertCircle',
  'alert-triangle': 'AlertTriangle',
  'x-circle': 'XCircle',

  // Stats & Charts
  'chart-line': 'ChartLine',
  'trend-up': 'TrendUp',
  'bar-chart': 'BarChart',
  'pie-chart': 'PieChart',
  'analytics': 'Analytics',
  'dashboard': 'Dashboard',
  'stats': 'Stats',

  // Security
  'shield-check': 'ShieldCheck',
  'shield-warning': 'ShieldWarning',
  'shield-slash': 'ShieldSlash',
  'user-shield': 'UserShield',
  'verified': 'Verified',
  'verified-user': 'VerifiedUser',

  // Navigation
  'house': 'House',
  'sign-in': 'SignIn',
  'sign-out': 'SignOut',
  'user-circle': 'UserCircle',
  'user-plus': 'UserPlus',
  'user-minus': 'UserMinus',

  // MUI compatibility mappings
  'AccountCircle': 'AccountCircle',
  'Dashboard': 'Dashboard',
  'Settings': 'Settings',
  'Menu': 'Menu',
  'Search': 'Search',
  'Notifications': 'Notifications',
  'Email': 'Email',
  'Delete': 'Delete',
  'Edit': 'Edit',
  'Add': 'Add',
  'Remove': 'Remove',
  'ChevronRight': 'ChevronRight',
  'ChevronLeft': 'ChevronLeft',
  'ExpandMore': 'ExpandMore',
  'ExpandLess': 'ExpandLess',
  'MoreVert': 'MoreVert',
  'MoreHoriz': 'MoreHoriz',
  'Close': 'Close',
  'Check': 'Check',
  'CheckCircle': 'CheckCircle',
  'Error': 'CircleX',
  'Warning': 'Warning',
  'Info': 'Info',
  'Visibility': 'Visibility',
  'VisibilityOff': 'VisibilityOff',
  'Lock': 'Lock',
  'LockOpen': 'LockOpen',
}

/**
 * Get the actual fakemui icon name from a Lua icon name
 * Handles aliases and case variations
 *
 * @param luaIconName - Icon name from Lua (can be lowercase, kebab-case, PascalCase, etc.)
 * @returns The actual fakemui icon name or undefined if not found
 */
export function resolveIconName(luaIconName: string): IconName | undefined {
  // First try direct match (case-sensitive)
  if (luaIconName in FakeMuiIcons) {
    return luaIconName as IconName
  }

  // Try alias lookup
  if (luaIconName in iconNameAliases) {
    return iconNameAliases[luaIconName]
  }

  // Try case-insensitive match
  const lowerName = luaIconName.toLowerCase()
  const iconKeys = Object.keys(FakeMuiIcons) as IconName[]
  const match = iconKeys.find(key => key.toLowerCase() === lowerName)

  return match
}

/**
 * Get the fakemui icon component by name
 *
 * @param iconName - Icon name (can be alias or actual name)
 * @returns The icon component or undefined if not found
 */
export function getIconComponent(iconName: string): typeof FakeMuiIcons.Icon | undefined {
  const resolvedName = resolveIconName(iconName)
  if (!resolvedName) {
    return undefined
  }

  return FakeMuiIcons[resolvedName] as typeof FakeMuiIcons.Icon
}

/**
 * Check if an icon name is valid
 *
 * @param iconName - Icon name to check
 * @returns True if the icon exists
 */
export function isValidIconName(iconName: string): boolean {
  return resolveIconName(iconName) !== undefined
}

/**
 * Get all available icon names (actual names, not aliases)
 *
 * @returns Array of all fakemui icon names
 */
export function getAllIconNames(): IconName[] {
  return Object.keys(FakeMuiIcons).filter(key => key !== 'Icon' && key !== 'IconProps') as IconName[]
}

/**
 * Get all icon aliases
 *
 * @returns Record of all icon aliases
 */
export function getAllIconAliases(): Record<string, IconName> {
  return { ...iconNameAliases }
}
