import React from 'react'
import { Icon, IconProps } from './Icon'

export const Share = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="176" cy="64" r="32" />
    <circle cx="80" cy="128" r="32" />
    <circle cx="176" cy="192" r="32" />
    <line x1="108.3" y1="142.7" x2="147.7" y2="177.3" />
    <line x1="108.3" y1="113.3" x2="147.7" y2="78.7" />
  </Icon>
)
