import React from 'react'
import { Icon, IconProps } from './Icon'

export const Language = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="96" fill="none" />
    <ellipse cx="128" cy="128" rx="48" ry="96" fill="none" />
    <line x1="32" y1="128" x2="224" y2="128" />
    <path d="M48 80h160" fill="none" />
    <path d="M48 176h160" fill="none" />
  </Icon>
)
