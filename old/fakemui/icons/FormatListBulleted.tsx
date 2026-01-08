import React from 'react'
import { Icon, IconProps } from './Icon'

export const FormatListBulleted = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="64" cy="64" r="8" />
    <circle cx="64" cy="128" r="8" />
    <circle cx="64" cy="192" r="8" />
    <line x1="104" y1="64" x2="216" y2="64" />
    <line x1="104" y1="128" x2="216" y2="128" />
    <line x1="104" y1="192" x2="216" y2="192" />
  </Icon>
)
