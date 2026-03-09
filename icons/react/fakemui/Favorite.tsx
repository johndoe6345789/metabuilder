import React from 'react'
import { MaterialIcon } from './MaterialIcon'
import { IconProps } from './createMaterialIcon'

// Favorite uses a filled heart
export const Favorite = ({ weight, ...props }: IconProps) => {
  const weightMap: Record<string, number> = {
    thin: 100,
    light: 300,
    regular: 400,
    bold: 700,
  }
  const fontWeight = typeof weight === 'string' ? weightMap[weight] ?? 400 : weight

  return <MaterialIcon name="favorite" fill={1} weight={fontWeight} {...props} />
}

Favorite.displayName = 'Favorite'
