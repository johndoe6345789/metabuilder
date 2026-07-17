import React from 'react'
import { Icon, IconProps } from './Icon'

export const ArrowSquareIn = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="88 168 88 88 168 88" />
    <line x1="88" y1="88" x2="192" y2="192" />
    <path d="M192 96V48a8 8 0 0 0-8-8h-48" />
    <path d="M192 160v40a8 8 0 0 1-8 8H48a8 8 0 0 1-8-8V56a8 8 0 0 1 8-8h40" />
  </Icon>
)
