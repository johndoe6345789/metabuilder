import React from 'react'
import { Icon, IconProps } from './Icon'

export const RemoveCircle = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="96" />
    <line x1="88" y1="128" x2="168" y2="128" />
  </Icon>
)
