import React from 'react'

export interface IconProps extends React.SVGAttributes<SVGElement> {
  size?: number | string
  weight?: 'thin' | 'light' | 'regular' | 'bold'
}

export const Icon = ({
  size = 24,
  weight = 'regular',
  children,
  className = '',
  ...props
}: IconProps & { children: React.ReactNode }) => {
  const strokeWidth = weight === 'thin' ? 1 : weight === 'light' ? 1.5 : weight === 'bold' ? 2.5 : 2

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    >
      {children}
    </svg>
  )
}
