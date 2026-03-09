import React from 'react'
import { Icon, IconProps } from './Icon'

export const FormatStrikethrough = (props: IconProps) => (
  <Icon {...props}>
    <line x1="40" y1="128" x2="216" y2="128" />
    <path d="M80 96V80a48 48 0 0 1 48-48h48" fill="none" />
    <path d="M176 160v16a48 48 0 0 1-48 48H80" fill="none" />
  </Icon>
)
