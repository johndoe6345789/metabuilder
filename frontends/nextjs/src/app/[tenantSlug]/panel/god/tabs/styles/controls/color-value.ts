/** Whether a stored color value is a theme token (a CSS var) or custom. */
export function isThemedColor(value: string | undefined): boolean {
  return value?.startsWith('var(') === true
}
