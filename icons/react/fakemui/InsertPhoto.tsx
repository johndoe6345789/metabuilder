import React from 'react'
import { Icon, IconProps } from './Icon'

export const InsertPhoto = (props: IconProps) => (
  <Icon {...props}>
    <rect x="40" y="40" width="176" height="176" rx="8" fill="none" />
    <circle cx="96" cy="96" r="16" />
    <path d="M40 176l48-48a16 16 0 0 1 22.6 0l100 100" fill="none" />
    <path d="M152 128l24-24a16 16 0 0 1 22.6 0L216 120" fill="none" />
  </Icon>
)
