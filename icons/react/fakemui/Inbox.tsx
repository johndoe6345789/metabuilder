import React from 'react'
import type { IconProps } from './types'

export const Inbox: React.FC<IconProps> = ({
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
      <rect x="32" y="48" width="192" height="160" rx="8" />
      <path d="M32 144h56a8 8 0 0 1 8 8 32 32 0 0 0 64 0 8 8 0 0 1 8-8h56" />
    </svg>
  )
}
