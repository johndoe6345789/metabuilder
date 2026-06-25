import React from 'react'
import { Icon, IconProps } from './Icon'

export const FileArrowUp = (props: IconProps) => (
  <Icon {...props}>
    <path d="M200 224H56a8 8 0 0 1-8-8V40a8 8 0 0 1 8-8h96l56 56v128a8 8 0 0 1-8 8Z" />
    <polyline points="152 32 152 88 208 88" />
    <line x1="128" y1="200" x2="128" y2="136" />
    <polyline points="96 168 128 136 160 168" />
  </Icon>
)
