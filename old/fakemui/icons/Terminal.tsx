import React from 'react'
import { Icon, IconProps } from './Icon'

export const Terminal = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="48" width="192" height="160" rx="8" />
    <polyline points="80 112 112 144 80 176" />
    <line x1="144" y1="176" x2="176" y2="176" />
  </Icon>
)
