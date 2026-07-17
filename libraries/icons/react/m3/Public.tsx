import React from 'react'
import { Icon, IconProps } from './Icon'

export const Public = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="96" />
    <ellipse cx="128" cy="128" rx="40" ry="96" />
    <line x1="32" y1="128" x2="224" y2="128" />
    <path d="M128 32 C128 32 88 64 88 128 C88 192 128 224 128 224" />
    <path d="M128 32 C128 32 168 64 168 128 C168 192 128 224 128 224" />
  </Icon>
)
