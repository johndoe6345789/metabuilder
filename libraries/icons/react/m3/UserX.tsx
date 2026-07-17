import React from 'react'
import { Icon, IconProps } from './Icon'

export const UserX = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="96" cy="88" r="32" />
    <path d="M32 200c0-35.3 28.7-64 64-64s64 28.7 64 64" />
    <line x1="176" y1="112" x2="224" y2="160" />
    <line x1="224" y1="112" x2="176" y2="160" />
  </Icon>
)
