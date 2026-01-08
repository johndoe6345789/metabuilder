import React from 'react'
import { Icon, IconProps } from './Icon'

export const Download = (props: IconProps) => (
  <Icon {...props}>
    <line x1="128" y1="24" x2="128" y2="168" />
    <polyline points="80 120 128 168 176 120" />
    <path d="M216 168v40a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8v-40" />
  </Icon>
)
