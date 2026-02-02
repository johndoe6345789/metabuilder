import React from 'react'
import { Icon, IconProps } from './Icon'

export const ZoomIn = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="112" cy="112" r="80" />
    <line x1="168" y1="168" x2="224" y2="224" />
    <line x1="80" y1="112" x2="144" y2="112" />
    <line x1="112" y1="80" x2="112" y2="144" />
  </Icon>
)
