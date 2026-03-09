import React from 'react'
import { Icon, IconProps } from './Icon'

export const ShieldWarning = (props: IconProps) => (
  <Icon {...props}>
    <path d="M40 114.7V56a8 8 0 0 1 8-8h160a8 8 0 0 1 8 8v58.7c0 84.8-71.3 111.8-85.5 116.5a7.2 7.2 0 0 1-5 0C111.3 226.5 40 199.5 40 114.7Z" />
    <line x1="128" y1="88" x2="128" y2="128" />
    <circle cx="128" cy="168" r="12" fill="currentColor" />
  </Icon>
)
