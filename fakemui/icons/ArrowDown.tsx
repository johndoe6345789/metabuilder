import React from 'react'
import { Icon, IconProps } from './Icon'

export const ArrowDown = (props: IconProps) => (
  <Icon {...props}>
    <line x1="128" y1="40" x2="128" y2="216" />
    <polyline points="56 144 128 216 200 144" />
  </Icon>
)
