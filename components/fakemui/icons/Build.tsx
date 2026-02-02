import React from 'react'
import { Icon, IconProps } from './Icon'

export const Build = (props: IconProps) => (
  <Icon {...props}>
    <path d="M192 48 L192 88 L152 88 L152 48 C152 30.3 166.3 16 184 16 L208 16" />
    <rect x="112" y="88" width="80" height="152" rx="8" />
    <line x1="144" y1="120" x2="160" y2="120" />
    <line x1="144" y1="152" x2="160" y2="152" />
    <path d="M64 88 L64 48 C64 30.3 49.7 16 32 16 L16 16" />
    <line x1="64" y1="88" x2="64" y2="240" />
  </Icon>
)
