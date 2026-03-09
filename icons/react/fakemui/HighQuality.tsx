import React from 'react'
import { Icon, IconProps } from './Icon'

export const HighQuality = (props: IconProps) => (
  <Icon {...props}>
    <rect x="24" y="48" width="208" height="160" rx="8" />
    <path d="M56 96 L56 160" />
    <path d="M88 96 L88 160" />
    <path d="M56 128 L88 128" />
    <path d="M120 96 L120 160" />
    <path d="M120 96 L152 160" />
    <path d="M152 96 L152 160" />
    <path d="M184 96 C200 96 200 120 184 128 C200 128 200 160 184 160 L168 160 L168 96 L184 96" />
  </Icon>
)
