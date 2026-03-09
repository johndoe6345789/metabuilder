import React from 'react'
import { Icon, IconProps } from './Icon'

export const Subtitles = (props: IconProps) => (
  <Icon {...props}>
    <rect x="24" y="48" width="208" height="160" rx="8" />
    <line x1="56" y1="144" x2="120" y2="144" />
    <line x1="136" y1="144" x2="200" y2="144" />
    <line x1="56" y1="176" x2="88" y2="176" />
    <line x1="104" y1="176" x2="168" y2="176" />
    <line x1="184" y1="176" x2="200" y2="176" />
  </Icon>
)
