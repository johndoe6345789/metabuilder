import React from 'react'
import { Icon, IconProps } from './Icon'

export const Shuffle = (props: IconProps) => (
  <Icon {...props}>
    <path d="M48 80 L160 80 L208 128" />
    <path d="M48 176 L160 176 L208 128" />
    <polyline points="184,104 208,128 184,152" />
    <polyline points="184,56 208,80 184,104" />
    <polyline points="184,152 208,176 184,200" />
    <path d="M48 80 L96 80" />
    <path d="M48 176 L96 176" />
  </Icon>
)
