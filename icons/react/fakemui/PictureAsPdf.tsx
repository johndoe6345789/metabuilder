import React from 'react'
import { Icon, IconProps } from './Icon'

export const PictureAsPdf = (props: IconProps) => (
  <Icon {...props}>
    <path d="M64 32 L64 224 L192 224 L192 80 L144 32 Z" />
    <polyline points="144,32 144,80 192,80" />
    <text x="88" y="164" fontSize="40" fill="currentColor" stroke="none" fontFamily="sans-serif" fontWeight="bold">PDF</text>
  </Icon>
)
