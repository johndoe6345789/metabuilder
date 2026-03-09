import React from 'react'
import { Icon, IconProps } from './Icon'

export const ArrowRight = (props: IconProps) => (
  <Icon {...props}>
    <line x1="40" y1="128" x2="216" y2="128" />
    <polyline points="144 56 216 128 144 200" />
  </Icon>
)
