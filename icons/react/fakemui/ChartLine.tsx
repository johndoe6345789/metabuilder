import React from 'react'
import type { IconProps } from './types'

export const ChartLine: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  weight = 'regular',
  className = '',
  ...props
}) => {
  const strokeWidths = {
    thin: 1,
    light: 1.5,
    regular: 2,
    bold: 2.5,
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidths[weight]}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <polyline points="48 208 48 48" />
      <polyline points="48 208 208 208" />
      <polyline points="48 160 96 112 144 144 208 72" />
      <polyline points="176 72 208 72 208 104" />
    </svg>
  )
}
