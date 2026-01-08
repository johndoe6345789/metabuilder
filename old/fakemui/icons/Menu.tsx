import React from 'react'
import { Icon, IconProps } from './Icon'

export const Menu = (props: IconProps) => (
  <Icon {...props}>
    <line x1="40" y1="128" x2="216" y2="128" />
    <line x1="40" y1="64" x2="216" y2="64" />
    <line x1="40" y1="192" x2="216" y2="192" />
  </Icon>
)
