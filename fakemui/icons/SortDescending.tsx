import React from 'react'
import { Icon, IconProps } from './Icon'

export const SortDescending = (props: IconProps) => (
  <Icon {...props}>
    <line x1="128" y1="40" x2="128" y2="216" />
    <polyline points="56,144 128,216 200,144" />
    <line x1="40" y1="48" x2="88" y2="48" />
    <line x1="40" y1="80" x2="104" y2="80" />
    <line x1="40" y1="112" x2="72" y2="112" />
  </Icon>
)

export default SortDescending
