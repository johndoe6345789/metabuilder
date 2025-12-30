import React from 'react'
import { Icon, IconProps } from './Icon'

export const Json = (props: IconProps) => (
  <Icon {...props}>
    <path d="M200,224H56a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8h96l56,56V216A8,8,0,0,1,200,224Z" />
    <polyline points="152,32 152,88 208,88" />
    <path d="M96,136c0-16-8-24-24-24" />
    <path d="M96,136c0,16-8,24-24,24" />
    <path d="M160,136c0-16,8-24,24-24" />
    <path d="M160,136c0,16,8,24,24,24" />
  </Icon>
)

export default Json
