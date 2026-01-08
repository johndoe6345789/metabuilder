import React from 'react'
import { Icon, IconProps } from './Icon'

export const People = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="88" cy="80" r="32" />
    <path d="M32 192 C32 144 56 120 88 120 C120 120 144 144 144 192" />
    <circle cx="168" cy="80" r="32" />
    <path d="M144 192 C144 152 160 128 168 128 C200 128 224 152 224 192" />
  </Icon>
)
