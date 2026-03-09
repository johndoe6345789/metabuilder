import React from 'react'
import { Icon, IconProps } from './Icon'

export const AspectRatio = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="48" width="192" height="160" rx="8" />
    <polyline points="56,96 56,72 80,72" />
    <polyline points="176,72 200,72 200,96" />
    <polyline points="200,160 200,184 176,184" />
    <polyline points="80,184 56,184 56,160" />
  </Icon>
)
