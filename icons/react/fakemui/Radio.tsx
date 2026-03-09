import React from 'react'
import { Icon, IconProps } from './Icon'

export const Radio = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="72" width="192" height="128" rx="8" />
    <circle cx="88" cy="144" r="32" />
    <line x1="144" y1="112" x2="200" y2="112" />
    <line x1="144" y1="136" x2="200" y2="136" />
    <line x1="144" y1="160" x2="184" y2="160" />
    <path d="M200 72 L176 40 L128 40" />
  </Icon>
)
