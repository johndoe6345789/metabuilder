import React from 'react'
import { Icon, IconProps } from './Icon'

export const PieChart = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="88" />
    <path d="M128 40 L128 128 L216 128" />
    <path d="M128 128 L176 60" />
  </Icon>
)
