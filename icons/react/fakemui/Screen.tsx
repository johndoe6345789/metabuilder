import React from 'react'
import { Icon, IconProps } from './Icon'

export const Screen = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="48" width="192" height="144" rx="16" />
    <line x1="96" y1="224" x2="160" y2="224" />
    <line x1="128" y1="192" x2="128" y2="224" />
  </Icon>
)
