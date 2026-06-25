import React from 'react'
import { Icon, IconProps } from './Icon'

export const UserShield = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="96" cy="88" r="32" />
    <path d="M32 200c0-35.3 28.7-64 64-64s64 28.7 64 64" />
    <path d="M160 64l44 16v40c0 34.5-20.7 65.6-52 78.6-31.3-13-52-44.1-52-78.6V80l60-16z" />
  </Icon>
)
