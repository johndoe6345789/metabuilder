import React from 'react'
import { Icon, IconProps } from './Icon'

export const Volume = (props: IconProps) => (
  <Icon {...props}>
    <path d="M80 168H32a8 8 0 0 1-8-8V96a8 8 0 0 1 8-8h48l72-56v192Z" />
    <line x1="80" y1="88" x2="80" y2="168" />
    <path d="M190.5 73.5a72 72 0 0 1 0 109" />
    <path d="M166.5 97.5a32 32 0 0 1 0 61" />
  </Icon>
)
