import React from 'react'
import { Icon, IconProps } from './Icon'

export const GitBranch = (props: IconProps) => (
  <Icon {...props}>
    <line x1="128" y1="160" x2="128" y2="64" />
    <circle cx="128" cy="48" r="24" />
    <circle cx="128" cy="176" r="24" />
    <circle cx="192" cy="96" r="24" />
    <path d="M128 160a40 40 0 0 1 40-40h24" fill="none" />
  </Icon>
)
