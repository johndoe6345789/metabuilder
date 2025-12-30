import React from 'react'
import type { IconProps } from './types'

export const Edit: React.FC<IconProps> = ({
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
      <path d="M92.7 216H48a8 8 0 0 1-8-8v-44.7a8 8 0 0 1 2.3-5.6l120-120a8 8 0 0 1 11.3 0l44.7 44.7a8 8 0 0 1 0 11.3l-120 120a8 8 0 0 1-5.6 2.3z" />
      <line x1="136" y1="64" x2="192" y2="120" />
      <line x1="40" y1="216" x2="96" y2="160" />
    </svg>
  )
}
