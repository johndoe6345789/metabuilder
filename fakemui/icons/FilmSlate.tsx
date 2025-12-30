import React from 'react'
import { Icon, IconProps } from './Icon'

export const FilmSlate = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="80" width="192" height="144" rx="8" />
    <line x1="32" y1="120" x2="224" y2="120" />
    <path d="M32 80 L72 40 L152 40 L112 80" />
    <line x1="72" y1="40" x2="112" y2="80" />
    <line x1="112" y1="40" x2="152" y2="80" />
    <line x1="72" y1="150" x2="72" y2="190" />
    <line x1="112" y1="150" x2="112" y2="190" />
    <line x1="152" y1="150" x2="152" y2="190" />
    <line x1="192" y1="150" x2="192" y2="190" />
  </Icon>
)
