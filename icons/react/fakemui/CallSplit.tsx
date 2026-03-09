import React from 'react'
import { Icon, IconProps } from './Icon'

export const CallSplit = (props: IconProps) => (
  <Icon {...props}>
    <line x1="128" y1="128" x2="128" y2="224" />
    <polyline points="64 96 128 32 192 96" />
    <path d="M128 128l-48 48" />
    <path d="M128 128l48 48" />
  </Icon>
)
