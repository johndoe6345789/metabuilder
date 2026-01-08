import React from 'react'
import { Icon, IconProps } from './Icon'

export const SkipNext = (props: IconProps) => (
  <Icon {...props}>
    <polygon points="80,64 176,128 80,192" />
    <line x1="192" y1="64" x2="192" y2="192" />
  </Icon>
)
