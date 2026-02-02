import React from 'react'
import { Icon, IconProps } from './Icon'

export const Smartphone = (props: IconProps) => (
  <Icon {...props}>
    <rect x="64" y="24" width="128" height="208" rx="16" fill="none" />
    <line x1="104" y1="56" x2="152" y2="56" />
    <circle cx="128" cy="200" r="8" />
  </Icon>
)
