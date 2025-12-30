import React from 'react'
import { Icon, IconProps } from './Icon'

export const LockKey = (props: IconProps) => (
  <Icon {...props}>
    <rect x="40" y="88" width="176" height="128" rx="8" />
    <path d="M88 88V56a40 40 0 0 1 80 0v32" />
    <circle cx="128" cy="144" r="24" />
    <line x1="128" y1="168" x2="128" y2="192" />
  </Icon>
)
