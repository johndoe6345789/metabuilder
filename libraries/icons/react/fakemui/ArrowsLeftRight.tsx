import React from 'react'
import { Icon, IconProps } from './Icon'

export const ArrowsLeftRight = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="176 176 224 128 176 80" />
    <polyline points="80 176 32 128 80 80" />
    <line x1="32" y1="128" x2="224" y2="128" />
  </Icon>
)
