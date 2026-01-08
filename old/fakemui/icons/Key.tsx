import React from 'react'
import { Icon, IconProps } from './Icon'

export const Key = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="140" r="44" />
    <line x1="128" y1="96" x2="128" y2="24" />
    <line x1="128" y1="48" x2="160" y2="48" />
  </Icon>
)
