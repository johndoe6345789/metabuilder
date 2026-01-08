import React from 'react'
import { Icon, IconProps } from './Icon'

export const UserPlus = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="108" cy="100" r="60" />
    <path d="M22.2 200c21.6-38.6 62.8-64 85.8-64s64.2 25.4 85.8 64" />
    <line x1="200" y1="40" x2="200" y2="96" />
    <line x1="172" y1="68" x2="228" y2="68" />
  </Icon>
)
