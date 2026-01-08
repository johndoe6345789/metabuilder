import type { SVGProps } from 'react'

export type IconWeight = 'thin' | 'light' | 'regular' | 'bold'

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
  weight?: IconWeight
}
