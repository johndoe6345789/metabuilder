import React from 'react'
import { Icon, IconProps } from './Icon'

export const Description = (props: IconProps) => (
  <Icon {...props}>
    <path d="M200 224H56a8 8 0 0 1-8-8V40a8 8 0 0 1 8-8h96l56 56v128a8 8 0 0 1-8 8Z" />
    <polyline points="152 32 152 88 208 88" />
    <line x1="88" y1="128" x2="168" y2="128" />
    <line x1="88" y1="160" x2="168" y2="160" />
    <line x1="88" y1="192" x2="128" y2="192" />
  </Icon>
)
