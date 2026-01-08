import React from 'react'
import type { IconProps } from './types'

export const AlertTriangle: React.FC<IconProps> = ({
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
      <path d="M114.5 40.2L22.1 196a16 16 0 0 0 13.9 24h184a16 16 0 0 0 13.9-24L141.5 40.2a16 16 0 0 0-27 0z" />
      <line x1="128" y1="104" x2="128" y2="144" />
      <circle cx="128" cy="180" r="8" fill={color} stroke="none" />
    </svg>
  )
}
