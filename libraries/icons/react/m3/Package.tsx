import React from 'react'
import { Icon, IconProps } from './Icon'

export const Package = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="32 80 128 32 224 80" />
    <polygon points="128 32 128 128 224 80 224 176 128 224 32 176 32 80 128 128" fill="none" />
    <line x1="128" y1="128" x2="128" y2="224" />
  </Icon>
)
