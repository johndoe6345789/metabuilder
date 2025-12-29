'use client'

import * as MuiIcons from '@mui/icons-material'
import { SvgIconProps } from '@mui/material'
import { forwardRef } from 'react'

export type IconName = keyof typeof MuiIcons
export type IconSize = 'small' | 'medium' | 'large' | 'inherit'

export interface IconProps extends Omit<SvgIconProps, 'fontSize'> {
  name: IconName
  size?: IconSize
}

const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 'medium', sx, ...props }, ref) => {
    const IconComponent = MuiIcons[name]

    if (!IconComponent) {
      console.warn(`Icon "${name}" not found in @mui/icons-material`)
      return null
    }

    const fontSizeMap = {
      small: 20,
      medium: 24,
      large: 32,
      inherit: 'inherit' as const,
    }

    return (
      <IconComponent
        ref={ref}
        sx={{
          fontSize: fontSizeMap[size],
          ...sx,
        }}
        {...props}
      />
    )
  }
)

Icon.displayName = 'Icon'

export { Icon }
