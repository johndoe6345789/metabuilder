import React from 'react'
import { Icon, IconProps } from './Icon'

export const Mic = (props: IconProps) => (
  <Icon {...props}>
    <rect x="88" y="32" width="80" height="120" rx="40" />
    <path d="M48 136 C48 180 80 208 128 208 C176 208 208 180 208 136" />
    <line x1="128" y1="208" x2="128" y2="240" />
    <line x1="88" y1="240" x2="168" y2="240" />
  </Icon>
)
