import React from 'react'
import { Icon, IconProps } from './Icon'

export const ArrowUp = (props: IconProps) => (
  <Icon {...props}>
    <line x1="128" y1="216" x2="128" y2="40" />
    <polyline points="56 112 128 40 200 112" />
  </Icon>
)
