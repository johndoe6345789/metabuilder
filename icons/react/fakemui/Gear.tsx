import React from 'react'
import { Icon, IconProps } from './Icon'

export const Gear = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="40" />
    <path d="M130.1 32H126l-8 24.7a72 72 0 0 0-33.2 19.2L56 67.3 41.4 93l20.4 15.5a72.2 72.2 0 0 0 0 38.9L41.4 163l14.6 25.7 28.8-8.6a72 72 0 0 0 33.2 19.2l8 24.7h4.1l4-.1 8-24.7a72 72 0 0 0 33.2-19.2l28.8 8.6 14.6-25.7-20.4-15.5a72.2 72.2 0 0 0 0-38.9l20.4-15.5L204 67.3l-28.8 8.6a72 72 0 0 0-33.2-19.2Z" />
  </Icon>
)
