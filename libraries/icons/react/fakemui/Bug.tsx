import React from 'react'
import { Icon, IconProps } from './Icon'

export const Bug = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="72" r="20" />
    <ellipse cx="128" cy="148" rx="40" ry="56" />
    <line x1="128" y1="92" x2="128" y2="104" />
    <line x1="108" y1="52" x2="88" y2="36" />
    <line x1="148" y1="52" x2="168" y2="36" />
    <line x1="88" y1="120" x2="48" y2="104" />
    <line x1="88" y1="148" x2="48" y2="148" />
    <line x1="88" y1="176" x2="52" y2="192" />
    <line x1="168" y1="120" x2="208" y2="104" />
    <line x1="168" y1="148" x2="208" y2="148" />
    <line x1="168" y1="176" x2="204" y2="192" />
  </Icon>
)
