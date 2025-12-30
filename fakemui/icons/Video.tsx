import React from 'react'
import { Icon, IconProps } from './Icon'

export const Video = (props: IconProps) => (
  <Icon {...props}>
    <rect x="24" y="60" width="176" height="136" rx="8" />
    <path d="M200 112l52-32v96l-52-32v-32z" />
  </Icon>
)
