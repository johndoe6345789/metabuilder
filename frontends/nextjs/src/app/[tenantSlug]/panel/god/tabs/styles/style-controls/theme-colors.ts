/**
 * The theme's colours, named for what they are for rather than what they are.
 *
 * Picking one stores `var(--mat-sys-…)` rather than a hex value, so the style
 * follows the tenant's theme and keeps working when it changes or the viewer
 * is in dark mode -- which a hex code picked out of a grid cannot do.
 */
export const THEME_COLORS: { label: string; token: string }[] = [
  { label: 'Brand', token: '--mat-sys-primary' },
  { label: 'On brand', token: '--mat-sys-on-primary' },
  { label: 'Text', token: '--mat-sys-on-surface' },
  { label: 'Page', token: '--mat-sys-surface' },
  { label: 'Card', token: '--mat-sys-surface-container' },
  { label: 'Highlight', token: '--mat-sys-secondary-container' },
  { label: 'Line', token: '--mat-sys-outline-variant' },
  { label: 'Danger', token: '--mat-sys-error' },
]

export const themeColorValue = (token: string): string => `var(${token})`
