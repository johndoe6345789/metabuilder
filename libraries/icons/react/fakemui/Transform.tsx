import React from 'react'
import { Icon, IconProps } from './Icon'

export const Transform = (props: IconProps) => (
  <Icon {...props}>
    <rect x="48" y="48" width="72" height="72" rx="4" />
    <rect x="136" y="136" width="72" height="72" rx="4" />
    <path d="M120 84 L172 136" />
    <polyline points="172,112 172,136 148,136" />
    <path d="M136 172 L84 120" />
    <polyline points="84,144 84,120 108,120" />
  </Icon>
)
