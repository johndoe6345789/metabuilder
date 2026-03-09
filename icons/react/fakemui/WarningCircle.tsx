import React from 'react'
import { Icon, IconProps } from './Icon'

export const WarningCircle = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="96" />
    <line x1="128" y1="80" x2="128" y2="136" />
    <circle cx="128" cy="172" r="12" fill="currentColor" />
  </Icon>
)
