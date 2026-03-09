import React from 'react'
import { Icon, IconProps } from './Icon'

export const Flag = (props: IconProps) => (
  <Icon {...props}>
    <line x1="64" y1="32" x2="64" y2="224" />
    <path d="M64 48h96l-16 32 16 32H64z" />
  </Icon>
)
