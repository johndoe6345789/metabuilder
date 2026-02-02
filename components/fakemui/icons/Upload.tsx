import React from 'react'
import { Icon, IconProps } from './Icon'

export const Upload = (props: IconProps) => (
  <Icon {...props}>
    <line x1="128" y1="168" x2="128" y2="24" />
    <polyline points="176 72 128 24 80 72" />
    <path d="M216 168v40a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8v-40" />
  </Icon>
)
