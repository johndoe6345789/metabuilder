import React from 'react'
import { Icon, IconProps } from './Icon'

export const Timer = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="144" r="72" />
    <line x1="128" y1="144" x2="128" y2="104" />
    <line x1="128" y1="144" x2="160" y2="144" />
    <line x1="104" y1="40" x2="152" y2="40" />
    <line x1="128" y1="40" x2="128" y2="72" />
    <path d="M192 88 L208 72" />
  </Icon>
)
