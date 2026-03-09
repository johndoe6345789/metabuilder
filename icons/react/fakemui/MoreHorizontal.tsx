import React from 'react'
import { Icon, IconProps } from './Icon'

export const MoreHorizontal = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="64" cy="128" r="16" fill="currentColor" />
    <circle cx="128" cy="128" r="16" fill="currentColor" />
    <circle cx="192" cy="128" r="16" fill="currentColor" />
  </Icon>
)
