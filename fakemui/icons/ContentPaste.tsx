import React from 'react'
import { Icon, IconProps } from './Icon'

/**
 * Content paste icon - paste from clipboard
 */
export const ContentPaste = (props: IconProps) => (
  <Icon {...props}>
    <rect x="56" y="56" width="144" height="176" rx="8" />
    <path d="M96 56 L96 40 C96 34 100 24 112 24 L144 24 C156 24 160 34 160 40 L160 56" />
    <rect x="96" y="24" width="64" height="32" rx="4" />
    <line x1="88" y1="112" x2="168" y2="112" />
    <line x1="88" y1="144" x2="168" y2="144" />
    <line x1="88" y1="176" x2="136" y2="176" />
  </Icon>
)
