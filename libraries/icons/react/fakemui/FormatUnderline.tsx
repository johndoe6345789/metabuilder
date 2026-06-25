import React from 'react'
import { Icon, IconProps } from './Icon'

export const FormatUnderline = (props: IconProps) => (
  <Icon {...props}>
    <path d="M128 168c44.2 0 80-35.8 80-80V40" fill="none" />
    <path d="M48 40v48c0 44.2 35.8 80 80 80s80-35.8 80-80V40" fill="none" />
    <line x1="48" y1="216" x2="208" y2="216" />
  </Icon>
)
