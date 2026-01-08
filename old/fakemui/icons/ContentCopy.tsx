import React from 'react'
import { Icon, IconProps } from './Icon'

/**
 * Content copy icon - duplicate/copy to clipboard
 */
export const ContentCopy = (props: IconProps) => (
  <Icon {...props}>
    <rect x="64" y="64" width="136" height="160" rx="8" />
    <path d="M192 64 L192 48 C192 36 182 32 172 32 L84 32 C72 32 64 40 64 52 L64 64" />
    <path d="M56 64 L56 192 C56 204 64 212 76 212 L64 212" />
    <rect x="40" y="48" width="136" height="160" rx="8" />
  </Icon>
)
