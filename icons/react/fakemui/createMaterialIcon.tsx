import React from 'react'
import { MaterialIcon, MaterialIconProps } from './MaterialIcon'

export interface IconProps extends Omit<MaterialIconProps, 'name' | 'weight'> {
  /** Icon size - maps to fontSize */
  size?: number | string
  /** Legacy weight prop - maps to font weight */
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'duotone' | 'fill' | number
}

const weightMap: Record<string, number> = {
  thin: 100,
  light: 300,
  regular: 400,
  bold: 700,
}

/**
 * Factory function to create a Material Symbol icon component.
 *
 * @param symbolName - The Material Symbols icon name (e.g., 'edit', 'star')
 * @param displayName - Optional display name for the component (defaults to PascalCase of symbolName)
 *
 * @example
 * ```tsx
 * export const Edit = createMaterialIcon('edit')
 * export const Star = createMaterialIcon('star')
 * export const ArrowUp = createMaterialIcon('arrow_upward', 'ArrowUp')
 * ```
 */
export function createMaterialIcon(symbolName: string, displayName?: string) {
  const Icon = ({ weight, ...props }: IconProps) => {
    const fontWeight = typeof weight === 'string' ? weightMap[weight] ?? 400 : weight

    return <MaterialIcon name={symbolName} weight={fontWeight} {...props} />
  }

  // Set display name for React DevTools
  const name =
    displayName ||
    symbolName
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')

  Icon.displayName = name

  return Icon
}
