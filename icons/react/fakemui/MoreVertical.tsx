import React from 'react'
import { Icon, IconProps } from './Icon'

export const MoreVertical = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="64" r="16" fill="currentColor" />
    <circle cx="128" cy="128" r="16" fill="currentColor" />
    <circle cx="128" cy="192" r="16" fill="currentColor" />
  </Icon>
)
