import React from 'react'
import { Icon, IconProps } from './Icon'

export const ViewCarousel = (props: IconProps) => (
  <Icon {...props}>
    <rect x="64" y="48" width="128" height="160" rx="8" />
    <rect x="16" y="80" width="32" height="96" rx="4" />
    <rect x="208" y="80" width="32" height="96" rx="4" />
  </Icon>
)
