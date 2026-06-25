import React from 'react'
import { Icon, IconProps } from './Icon'

export const Article = (props: IconProps) => (
  <Icon {...props}>
    <rect x="40" y="32" width="176" height="192" rx="8" />
    <line x1="72" y1="72" x2="184" y2="72" />
    <line x1="72" y1="104" x2="184" y2="104" />
    <line x1="72" y1="136" x2="184" y2="136" />
    <line x1="72" y1="168" x2="144" y2="168" />
  </Icon>
)
