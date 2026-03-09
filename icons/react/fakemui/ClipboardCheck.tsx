import React from 'react'
import { Icon, IconProps } from './Icon'

export const ClipboardCheck = (props: IconProps) => (
  <Icon {...props}>
    <rect x="40" y="40" width="176" height="176" rx="8" />
    <path d="M88 24h80a8 8 0 0 1 8 8v16H80V32a8 8 0 0 1 8-8Z" />
    <polyline points="84 140 112 168 172 108" />
  </Icon>
)
