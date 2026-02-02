import React from 'react'
import { Icon, IconProps } from './Icon'

export const Add = (props: IconProps) => (
  <Icon {...props}>
    <line x1="40" y1="128" x2="216" y2="128" />
    <line x1="128" y1="40" x2="128" y2="216" />
  </Icon>
)
