import React from 'react'
import { Icon, IconProps } from './Icon'

export const PushPinSimple = (props: IconProps) => (
  <Icon {...props}>
    <line x1="128" y1="160" x2="128" y2="232" />
    <line x1="48" y1="160" x2="208" y2="160" />
    <path d="M176 160V80l24-40H56l24 40v80" />
  </Icon>
)
