'use client'

import * as FakeMuiIcons from '@/fakemui/icons'
import { CSSProperties, forwardRef } from 'react'

// Create a type from the available fakemui icons
export type IconName = keyof typeof FakeMuiIcons
export type IconSize = 'small' | 'medium' | 'large' | 'inherit'

export interface IconProps {
  name: IconName
  size?: IconSize
  sx?: CSSProperties & Record<string, unknown>
  className?: string
  style?: CSSProperties
}

const sizeMap = {
  small: 20,
  medium: 24,
  large: 32,
  inherit: undefined,
}

const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 'medium', sx, className, style, ...props }, ref) => {
    const IconComponent = FakeMuiIcons[name]

    if (!IconComponent || typeof IconComponent !== 'function') {
      console.warn(`Icon "${name}" not found in @/fakemui/icons`)
      return null
    }

    const sizeValue = sizeMap[size]
    const combinedStyle = { ...style, ...sx }

    return (
      <IconComponent
        size={sizeValue}
        style={combinedStyle}
        className={className}
        {...props}
      />
    )
  }
)

Icon.displayName = 'Icon'

export { Icon }
