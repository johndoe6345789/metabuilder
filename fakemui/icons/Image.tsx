import React from 'react'
import { Icon, IconProps } from './Icon'

export const Image = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="48" width="192" height="160" rx="8" />
    <circle cx="96" cy="112" r="24" />
    <path d="m32 168 72-56 48 48 48-48 24 24" />
  </Icon>
)
