import React from 'react'
import { Icon, IconProps } from './Icon'

export const IdCard = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="56" width="192" height="144" rx="16" />
    <circle cx="96" cy="120" r="20" />
    <path d="M64 168c16-20 48-20 64 0" />
    <path d="M144 112h48" />
    <path d="M144 144h48" />
  </Icon>
)
