import React from 'react'
import { Icon, IconProps } from './Icon'

export const CircleCheck = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="96" />
    <polyline points="172 104 113.3 160 84 132" />
  </Icon>
)
