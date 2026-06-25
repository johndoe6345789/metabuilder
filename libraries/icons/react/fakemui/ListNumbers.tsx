import React from 'react'
import { Icon, IconProps } from './Icon'

export const ListNumbers = (props: IconProps) => (
  <Icon {...props}>
    <line x1="104" y1="64" x2="216" y2="64" />
    <line x1="104" y1="128" x2="216" y2="128" />
    <line x1="104" y1="192" x2="216" y2="192" />
    <polyline points="40 56 56 48 56 88" />
    <path d="M40 152c0-8 8-16 16-16s16 8 12 16l-24 32h24" />
    <path d="M40 192h24l-20 16c12 0 20 8 20 16a16 16 0 0 1-28 8" />
  </Icon>
)
