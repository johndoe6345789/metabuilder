import React from 'react'
import { Icon, IconProps } from './Icon'

/**
 * Print icon - printer with paper
 */
export const Print = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="64 88 64 32 192 32 192 88" />
    <rect x="32" y="88" width="192" height="96" rx="8" />
    <path d="M64 152 L64 224 L192 224 L192 152" />
    <line x1="88" y1="176" x2="168" y2="176" />
    <line x1="88" y1="200" x2="144" y2="200" />
    <circle cx="184" cy="120" r="8" fill="currentColor" />
  </Icon>
)
