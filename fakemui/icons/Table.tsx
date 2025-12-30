import React from 'react'
import { Icon, IconProps } from './Icon'

export const Table = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="48" width="192" height="160" rx="8" />
    <line x1="32" y1="96" x2="224" y2="96" />
    <line x1="32" y1="144" x2="224" y2="144" />
    <line x1="96" y1="96" x2="96" y2="208" />
  </Icon>
)
