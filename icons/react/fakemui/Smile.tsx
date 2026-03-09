import React from 'react'
import type { IconProps } from './types'

export const Smile: React.FC<IconProps> = ({
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
      <circle cx="92" cy="108" r="8" fill={color} stroke="none" />
      <circle cx="164" cy="108" r="8" fill={color} stroke="none" />
      <path d="M88 152a48 48 0 0 0 80 0" />
    </svg>
  )
}
