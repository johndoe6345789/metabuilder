import React from 'react'
import { Icon, IconProps } from './Icon'

export const GearSix = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="40" />
    <path d="M128 48v24" />
    <path d="M128 184v24" />
    <path d="M59.3 78.6l17 17" />
    <path d="M179.7 177.4l17 17" />
    <path d="M48 128h24" />
    <path d="M184 128h24" />
    <path d="M59.3 177.4l17-17" />
    <path d="M179.7 78.6l17-17" />
  </Icon>
)
