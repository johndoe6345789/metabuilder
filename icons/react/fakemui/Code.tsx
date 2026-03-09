import React from 'react'
import { Icon, IconProps } from './Icon'

export const Code = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="64 88 16 128 64 168" />
    <polyline points="192 88 240 128 192 168" />
    <line x1="160" y1="40" x2="96" y2="216" />
  </Icon>
)
