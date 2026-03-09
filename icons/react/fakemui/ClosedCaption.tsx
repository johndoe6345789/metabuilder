import React from 'react'
import { Icon, IconProps } from './Icon'

export const ClosedCaption = (props: IconProps) => (
  <Icon {...props}>
    <rect x="24" y="48" width="208" height="160" rx="8" />
    <path d="M88 128 C88 104 104 96 120 96 C128 96 136 100 140 104" />
    <path d="M156 128 C156 104 172 96 188 96 C196 96 204 100 208 104" />
    <path d="M88 128 C88 152 104 160 120 160 C128 160 136 156 140 152" />
    <path d="M156 128 C156 152 172 160 188 160 C196 160 204 156 208 152" />
  </Icon>
)
