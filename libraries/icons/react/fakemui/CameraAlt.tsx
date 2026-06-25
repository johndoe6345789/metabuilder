import React from 'react'
import { Icon, IconProps } from './Icon'

export const CameraAlt = (props: IconProps) => (
  <Icon {...props}>
    <path d="M96 56 L104 40 L152 40 L160 56" />
    <rect x="32" y="56" width="192" height="152" rx="12" />
    <circle cx="128" cy="136" r="48" />
    <circle cx="128" cy="136" r="32" />
    <circle cx="192" cy="88" r="12" />
  </Icon>
)
