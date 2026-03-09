import React from 'react'
import { Icon, IconProps } from './Icon'

export const Robot = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="56" width="192" height="160" rx="24" />
    <rect x="72" y="96" width="40" height="40" rx="8" />
    <rect x="144" y="96" width="40" height="40" rx="8" />
    <line x1="104" y1="168" x2="152" y2="168" />
    <line x1="128" y1="32" x2="128" y2="56" />
    <circle cx="128" cy="20" r="12" />
  </Icon>
)
