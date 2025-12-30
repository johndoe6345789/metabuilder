import React from 'react'
import { Icon, IconProps } from './Icon'

export const Database = (props: IconProps) => (
  <Icon {...props}>
    <ellipse cx="128" cy="64" rx="88" ry="40" />
    <path d="M40 64v48c0 22.1 39.4 40 88 40s88-17.9 88-40V64" />
    <path d="M40 112v48c0 22.1 39.4 40 88 40s88-17.9 88-40v-48" />
    <path d="M40 160v32c0 22.1 39.4 40 88 40s88-17.9 88-40v-32" />
  </Icon>
)
