import React from 'react'
import { Icon, IconProps } from './Icon'

export const Headphones = (props: IconProps) => (
  <Icon {...props}>
    <path d="M32 128 C32 72 72 32 128 32 C184 32 224 72 224 128 L224 176" />
    <rect x="32" y="144" width="32" height="64" rx="8" />
    <rect x="192" y="144" width="32" height="64" rx="8" />
  </Icon>
)
