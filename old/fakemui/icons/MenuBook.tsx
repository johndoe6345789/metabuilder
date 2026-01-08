import React from 'react'
import { Icon, IconProps } from './Icon'

export const MenuBook = (props: IconProps) => (
  <Icon {...props}>
    <path d="M128 56 C96 56 48 64 32 80 L32 200 C48 184 96 176 128 176" />
    <path d="M128 56 C160 56 208 64 224 80 L224 200 C208 184 160 176 128 176" />
    <line x1="128" y1="56" x2="128" y2="176" />
    <line x1="56" y1="100" x2="104" y2="100" />
    <line x1="56" y1="124" x2="104" y2="124" />
    <line x1="56" y1="148" x2="88" y2="148" />
    <line x1="152" y1="100" x2="200" y2="100" />
    <line x1="152" y1="124" x2="200" y2="124" />
  </Icon>
)
