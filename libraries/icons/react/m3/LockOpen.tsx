import React from 'react'
import { Icon, IconProps } from './Icon'

export const LockOpen = (props: IconProps) => (
  <Icon {...props}>
    <rect x="40" y="88" width="176" height="128" rx="8" />
    <path d="M88 88V56a40 40 0 0 1 80 0" fill="none" />
  </Icon>
)
