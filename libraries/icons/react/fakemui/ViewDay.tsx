import React from 'react'
import { Icon, IconProps } from './Icon'

export const ViewDay = (props: IconProps) => (
  <Icon {...props}>
    <line x1="32" y1="56" x2="224" y2="56" />
    <rect x="32" y="96" width="192" height="64" rx="8" />
    <line x1="32" y1="200" x2="224" y2="200" />
  </Icon>
)
