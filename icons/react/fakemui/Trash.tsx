import React from 'react'
import { Icon, IconProps } from './Icon'

export const Trash = (props: IconProps) => (
  <Icon {...props}>
    <line x1="216" y1="56" x2="40" y2="56" />
    <line x1="104" y1="104" x2="104" y2="168" />
    <line x1="152" y1="104" x2="152" y2="168" />
    <path d="M200,56V208a8,8,0,0,1-8,8H64a8,8,0,0,1-8-8V56" />
    <path d="M168,56V40a16,16,0,0,0-16-16H104A16,16,0,0,0,88,40V56" />
  </Icon>
)
