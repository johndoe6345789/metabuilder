import React from 'react'
import { Icon, IconProps } from './Icon'

export const CheckCircle = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="96" />
    <polyline points="88 136 112 160 168 104" />
  </Icon>
)
