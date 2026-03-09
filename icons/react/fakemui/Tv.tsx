import React from 'react'
import { Icon, IconProps } from './Icon'

export const Tv = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="56" width="192" height="128" rx="8" />
    <line x1="88" y1="216" x2="168" y2="216" />
    <line x1="128" y1="184" x2="128" y2="216" />
    <line x1="168" y1="96" x2="192" y2="72" />
    <line x1="192" y1="72" x2="208" y2="56" />
  </Icon>
)
