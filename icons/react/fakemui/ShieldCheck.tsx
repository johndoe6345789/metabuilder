import React from 'react'
import type { IconProps } from './types'

export const ShieldCheck: React.FC<IconProps> = ({
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
      <path d="M40 114V56a8 8 0 0 1 8-8h160a8 8 0 0 1 8 8v58c0 84-72 106-88 106s-88-22-88-106z" />
      <polyline points="88 136 112 160 168 104" />
    </svg>
  )
}
