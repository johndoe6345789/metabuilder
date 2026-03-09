import React from 'react'
import { Icon, IconProps } from './Icon'

export const ArrowUpDown = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="88,96 128,56 168,96" />
    <line x1="128" y1="56" x2="128" y2="136" />
    <polyline points="88,160 128,200 168,160" />
    <line x1="128" y1="200" x2="128" y2="120" />
  </Icon>
)
