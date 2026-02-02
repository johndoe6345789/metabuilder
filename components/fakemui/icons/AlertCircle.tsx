import React from 'react'
import type { IconProps } from './types'

export const AlertCircle: React.FC<IconProps> = ({
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
      <circle cx="128" cy="128" r="96" />
      <line x1="128" y1="80" x2="128" y2="136" />
      <circle cx="128" cy="172" r="8" fill={color} stroke="none" />
    </svg>
  )
}
