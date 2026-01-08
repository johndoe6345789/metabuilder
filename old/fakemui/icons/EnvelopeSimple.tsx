import React from 'react'
import { Icon, IconProps } from './Icon'

export const EnvelopeSimple = (props: IconProps) => (
  <Icon {...props}>
    <rect x="24" y="56" width="208" height="144" rx="8" />
    <polyline points="24 56 128 144 232 56" />
  </Icon>
)
