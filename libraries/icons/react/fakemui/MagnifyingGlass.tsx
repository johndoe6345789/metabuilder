import React from 'react'
import { Icon, IconProps } from './Icon'

export const MagnifyingGlass = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="112" cy="112" r="80" />
    <line x1="168" y1="168" x2="224" y2="224" />
  </Icon>
)
