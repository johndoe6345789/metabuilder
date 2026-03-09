import React from 'react'
import { Icon, IconProps } from './Icon'

export const ArrowLeft = (props: IconProps) => (
  <Icon {...props}>
    <line x1="216" y1="128" x2="40" y2="128" />
    <polyline points="112 56 40 128 112 200" />
  </Icon>
)
