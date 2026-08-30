/** Pure pieces of the contrast preview, kept apart from the DOM read. */

/** WCAG's "large text": 24px, or 18.66px when bold. */
export function isLargeText(sizePx: number, fontWeight: number): boolean {
  return sizePx >= 24 || (fontWeight >= 700 && sizePx >= 18.66)
}

export function contrastFails(
  ratio: number | null,
  floor: number
): ratio is number {
  return ratio !== null && ratio < floor
}
