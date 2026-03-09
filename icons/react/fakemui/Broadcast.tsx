import React from 'react'
import { Icon, IconProps } from './Icon'

export const Broadcast = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="32" />
    <path d="M77.1 178.9a80 80 0 0 1 0-101.8" />
    <path d="M178.9 77.1a80 80 0 0 1 0 101.8" />
    <path d="M44.9 211.1a128 128 0 0 1 0-166.2" />
    <path d="M211.1 44.9a128 128 0 0 1 0 166.2" />
  </Icon>
)
