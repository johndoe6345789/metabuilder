import React from 'react'
import { Icon, IconProps } from './Icon'

export const Timeline = (props: IconProps) => (
  <Icon {...props}>
    <polyline points="40 192 88 144 136 176 184 96 224 64" strokeWidth="3" />
    <circle cx="40" cy="192" r="8" fill="currentColor" stroke="none" />
    <circle cx="88" cy="144" r="8" fill="currentColor" stroke="none" />
    <circle cx="136" cy="176" r="8" fill="currentColor" stroke="none" />
    <circle cx="184" cy="96" r="8" fill="currentColor" stroke="none" />
    <circle cx="224" cy="64" r="8" fill="currentColor" stroke="none" />
  </Icon>
)
