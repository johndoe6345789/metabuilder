import React from 'react'
import { Icon, IconProps } from './Icon'

export const UserSwitch = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="96" r="56" />
    <path d="M200 200H56c8-25.6 38.4-48 72-48s64 22.4 72 48" />
    <polyline points="200 128 224 152 200 176" />
    <polyline points="56 128 32 104 56 80" />
    <path d="M224 152h-40" />
    <path d="M72 104H32" />
  </Icon>
)
