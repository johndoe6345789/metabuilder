import React from 'react'
import { Icon, IconProps } from './Icon'

export const ExternalLink = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="216 100 216 40 156 40" />
    <line x1="144" y1="112" x2="216" y2="40" />
    <path d="M184 136v72a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8V80a8 8 0 0 1 8-8h72" />
  </Icon>
)
