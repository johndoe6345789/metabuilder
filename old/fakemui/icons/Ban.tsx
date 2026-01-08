import React from 'react'
import { Icon, IconProps } from './Icon'

export const Ban = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="88" />
    <line x1="72" y1="72" x2="184" y2="184" />
  </Icon>
)
