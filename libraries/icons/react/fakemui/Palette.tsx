import React from 'react'
import { Icon, IconProps } from './Icon'

export const Palette = (props: IconProps) => (
  <Icon {...props}>
    <path d="M200.8 53.9A103.4 103.4 0 0 0 128 24a104 104 0 0 0 0 208c52.9 0 88-40 88-88 0-22.1-17.9-40-40-40h-32a24 24 0 0 1 0-48" />
    <circle cx="80" cy="120" r="16" fill="currentColor" />
    <circle cx="120" cy="80" r="16" fill="currentColor" />
    <circle cx="160" cy="80" r="16" fill="currentColor" />
    <circle cx="80" cy="168" r="16" fill="currentColor" />
    <circle cx="128" cy="192" r="16" fill="currentColor" />
  </Icon>
)
