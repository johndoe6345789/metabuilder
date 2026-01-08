import React from 'react'
import type { IconProps } from './types'

export const Lock: React.FC<IconProps> = ({
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
      <rect x="48" y="112" width="160" height="112" rx="8" />
      <path d="M80 112V80a48 48 0 0 1 96 0v32" />
      <circle cx="128" cy="164" r="12" fill={color} stroke="none" />
      <line x1="128" y1="176" x2="128" y2="196" />
    </svg>
  )
}
