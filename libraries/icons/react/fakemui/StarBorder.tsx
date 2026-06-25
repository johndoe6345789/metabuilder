import React from 'react'
import { MaterialIcon } from './MaterialIcon'
import { IconProps } from './createMaterialIcon'

// StarBorder uses the outlined star (fill=0)
export const StarBorder = ({ weight, ...props }: IconProps) => {
  const weightMap: Record<string, number> = {
    thin: 100,
    light: 300,
    regular: 400,
    bold: 700,
  }
  const fontWeight = typeof weight === 'string' ? weightMap[weight] ?? 400 : weight

  return <MaterialIcon name="star" fill={0} weight={fontWeight} {...props} />
}

StarBorder.displayName = 'StarBorder'
