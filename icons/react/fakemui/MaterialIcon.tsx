import React from 'react'

export interface MaterialIconProps extends React.HTMLAttributes<HTMLSpanElement> {
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

/**
 * Material Symbols icon component using the variable icon font.
 *
 * @example
 * ```tsx
 * <MaterialIcon name="edit" />
 * <MaterialIcon name="star" fill={1} />
 * <MaterialIcon name="add" size={32} weight={700} />
 * ```
 */
export const MaterialIcon = ({
  name,
  size = 24,
  weight = 400,
  fill = 0,
  grade = 0,
  opticalSize = 24,
  variant = 'outlined',
  className = '',
  style,
  ...props
}: MaterialIconProps) => {
  const fontClass = `material-symbols-${variant}`

  const iconStyle: React.CSSProperties = {
    fontSize: typeof size === 'number' ? `${size}px` : size,
    fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
    ...style,
  }

  return (
    <span
      className={`${fontClass} ${className}`.trim()}
      style={iconStyle}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  )
}
