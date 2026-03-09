import React from 'react'
import { Icon, IconProps } from './Icon'

export const SkipPrevious = (props: IconProps) => (
  <Icon {...props}>
    <polygon points="176,64 80,128 176,192" />
    <line x1="64" y1="64" x2="64" y2="192" />
  </Icon>
)
