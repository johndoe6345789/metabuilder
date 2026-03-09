import React from 'react'
import { Icon, IconProps } from './Icon'

export const CenterFocusStrong = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="32" fill="currentColor" stroke="none" />
    <path d="M88 32 L56 32 C42.7 32 32 42.7 32 56 L32 88" />
    <path d="M168 32 L200 32 C213.3 32 224 42.7 224 56 L224 88" />
    <path d="M88 224 L56 224 C42.7 224 32 213.3 32 200 L32 168" />
    <path d="M168 224 L200 224 C213.3 224 224 213.3 224 200 L224 168" />
  </Icon>
)
