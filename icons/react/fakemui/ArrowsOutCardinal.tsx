import React from 'react'
import { Icon, IconProps } from './Icon'

export const ArrowsOutCardinal = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="88 56 128 16 168 56" />
    <polyline points="88 200 128 240 168 200" />
    <polyline points="56 168 16 128 56 88" />
    <polyline points="200 168 240 128 200 88" />
    <line x1="128" y1="16" x2="128" y2="240" />
    <line x1="16" y1="128" x2="240" y2="128" />
  </Icon>
)
