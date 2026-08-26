'use client'

/**
 * Contrast between text and its background, measured from what the browser
 * actually painted rather than from the declarations.
 *
 * Reading computed styles is the only way that works here: a colour may be
 * `var(--mat-sys-primary)`, inherited from an ancestor, or not set at all, and
 * none of those can be resolved by looking at the rule on its own.
 */

/** WCAG AA for body text. Large text passes at 3, which the caller decides. */
export const AA_NORMAL = 4.5
export const AA_LARGE = 3

function channel(value: number): number {
  const c = value / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance([r, g, b]: [number, number, number]): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

/** Parse the rgb()/rgba() a computed style always returns. */
function parse(colour: string): [number, number, number, number] | null {
  const nums = colour.match(/[\d.]+/g)
  if (nums === null || nums.length < 3) return null
  return [
    Number(nums[0]),
    Number(nums[1]),
    Number(nums[2]),
    nums.length > 3 ? Number(nums[3]) : 1,
  ]
}

export function contrastRatio(fg: string, bg: string): number | null {
  const a = parse(fg)
  const b = parse(bg)
  if (a === null || b === null) return null
  // A transparent foreground has no meaningful ratio to report.
  if (a[3] === 0) return null
  const l1 = luminance([a[0], a[1], a[2]])
  const l2 = luminance([b[0], b[1], b[2]])
  const [light, dark] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (light + 0.05) / (dark + 0.05)
}

/**
 * The background actually behind an element: its own, or the first ancestor
 * with one that is not transparent. An element with no background of its own
 * is drawn on whatever is underneath it, which is what the reader sees.
 */
export function effectiveBackground(el: HTMLElement): string {
  let node: HTMLElement | null = el
  while (node !== null) {
    const bg = getComputedStyle(node).backgroundColor
    const parsed = parse(bg)
    if (parsed !== null && parsed[3] > 0) return bg
    node = node.parentElement
  }
  return 'rgb(255, 255, 255)'
}
