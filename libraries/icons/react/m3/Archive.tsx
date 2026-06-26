import React from 'react'
import { Icon, IconProps } from './Icon'

export const Archive = (props: IconProps) => (
  <Icon {...props}>
    <rect x="24" y="56" width="208" height="40" rx="8" />
    <path d="M40 96v112a8 8 0 0 0 8 8h160a8 8 0 0 0 8-8V96" />
    <line x1="104" y1="136" x2="152" y2="136" />
  </Icon>
)
