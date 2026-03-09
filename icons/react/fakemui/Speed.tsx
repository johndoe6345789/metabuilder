import React from 'react'
import { Icon, IconProps } from './Icon'

export const Speed = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="136" r="80" />
    <path d="M128 136 L128 80" />
    <path d="M128 136 L168 112" />
    <circle cx="128" cy="136" r="8" />
    <line x1="72" y1="136" x2="80" y2="136" />
    <line x1="176" y1="136" x2="184" y2="136" />
    <line x1="128" y1="72" x2="128" y2="80" />
  </Icon>
)
