import React from 'react'
import { Icon, IconProps } from './Icon'

export const QrCode = (props: IconProps) => (
  <Icon {...props}>
    <rect x="48" y="48" width="56" height="56" rx="4" fill="none" />
    <rect x="152" y="48" width="56" height="56" rx="4" fill="none" />
    <rect x="48" y="152" width="56" height="56" rx="4" fill="none" />
    <rect x="68" y="68" width="16" height="16" />
    <rect x="172" y="68" width="16" height="16" />
    <rect x="68" y="172" width="16" height="16" />
    <rect x="152" y="152" width="24" height="24" />
    <rect x="184" y="152" width="24" height="24" />
    <rect x="152" y="184" width="24" height="24" />
    <rect x="184" y="184" width="24" height="24" />
  </Icon>
)
