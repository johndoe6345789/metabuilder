import React from 'react'
import { Icon, IconProps } from './Icon'

export const VolumeOff = (props: IconProps) => (
  <Icon {...props}>
    <path d="M80 168H32a8 8 0 0 1-8-8V96a8 8 0 0 1 8-8h48l72-56v192Z" />
    <line x1="80" y1="88" x2="80" y2="168" />
    <line x1="240" y1="104" x2="192" y2="152" />
    <line x1="240" y1="152" x2="192" y2="104" />
  </Icon>
)
