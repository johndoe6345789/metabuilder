import React from 'react'
import { Icon, IconProps } from './Icon'

export const Pin = (props: IconProps) => (
  <Icon {...props}>
    <line x1="96" y1="160" x2="40" y2="216" />
    <path d="M176 32l48 48-32 32 8 64-80-80 64-8-8-56Z" />
  </Icon>
)
