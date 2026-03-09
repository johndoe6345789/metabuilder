import type { SVGProps, HTMLAttributes } from 'react'

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'duotone' | 'fill'

// Legacy SVG-based icon props
export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
  weight?: IconWeight
}

// Material Symbols font-based icon props
export interface MaterialIconProps extends HTMLAttributes<HTMLSpanElement> {
  /** Material Symbols icon name (e.g., 'edit', 'star', 'add') */
  name: string
  /** Icon size in pixels or CSS value */
  size?: number | string
  /** Font weight for variable font: 100-700 */
  weight?: number
  /** Fill state: 0 (outline) or 1 (filled) */
  fill?: 0 | 1
  /** Grade: -25 to 200 */
  grade?: number
  /** Optical size: 20, 24, 40, or 48 */
  opticalSize?: 20 | 24 | 40 | 48
  /** Icon variant: outlined (default), rounded, or sharp */
  variant?: 'outlined' | 'rounded' | 'sharp'
}
