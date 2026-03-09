import React from 'react'
import { Icon, IconProps } from './Icon'

export const Globe = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="96" />
    <ellipse cx="128" cy="128" rx="40" ry="96" />
    <line x1="32" y1="128" x2="224" y2="128" />
  </Icon>
)
