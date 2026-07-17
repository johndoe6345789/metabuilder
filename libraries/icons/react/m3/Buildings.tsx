import React from 'react'
import { Icon, IconProps } from './Icon'

export const Buildings = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="56" width="80" height="168" rx="8" />
    <rect x="144" y="96" width="80" height="128" rx="8" />
    <line x1="112" y1="104" x2="144" y2="104" />
    <line x1="56" y1="88" x2="88" y2="88" />
    <line x1="56" y1="120" x2="88" y2="120" />
    <line x1="56" y1="152" x2="88" y2="152" />
    <line x1="168" y1="128" x2="200" y2="128" />
    <line x1="168" y1="160" x2="200" y2="160" />
  </Icon>
)
