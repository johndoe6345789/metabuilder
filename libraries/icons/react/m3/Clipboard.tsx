import React from 'react'
import { Icon, IconProps } from './Icon'

export const Clipboard = (props: IconProps) => (
  <Icon {...props}>
    <rect x="40" y="40" width="176" height="176" rx="8" />
    <path d="M88 24h80a8 8 0 0 1 8 8v16H80V32a8 8 0 0 1 8-8Z" />
    <line x1="80" y1="104" x2="176" y2="104" />
    <line x1="80" y1="136" x2="176" y2="136" />
    <line x1="80" y1="168" x2="144" y2="168" />
  </Icon>
)
