import React from 'react'
import { Icon, IconProps } from './Icon'

export const Clock = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="96" />
    <polyline points="128 72 128 128 184 128" />
  </Icon>
)
