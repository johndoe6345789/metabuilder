import React from 'react'
import { Icon, IconProps } from './Icon'

export const FormatListNumbered = (props: IconProps) => (
  <Icon {...props}>
    <path d="M48 48h16v32H48" fill="none" />
    <path d="M48 104h16l-16 20h16" fill="none" />
    <path d="M48 168h12a8 8 0 1 1 0 16H48v4h12a8 8 0 1 1 0 16H48" fill="none" />
    <line x1="104" y1="64" x2="216" y2="64" />
    <line x1="104" y1="128" x2="216" y2="128" />
    <line x1="104" y1="192" x2="216" y2="192" />
  </Icon>
)
