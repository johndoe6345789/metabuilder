import React from 'react'
import { Icon, IconProps } from './Icon'

export const Sun = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="128" cy="128" r="60" />
    <line x1="128" y1="28" x2="128" y2="12" />
    <line x1="128" y1="244" x2="128" y2="228" />
    <line x1="198.7" y1="57.3" x2="210" y2="46" />
    <line x1="46" y1="210" x2="57.3" y2="198.7" />
    <line x1="228" y1="128" x2="244" y2="128" />
    <line x1="12" y1="128" x2="28" y2="128" />
    <line x1="198.7" y1="198.7" x2="210" y2="210" />
    <line x1="46" y1="46" x2="57.3" y2="57.3" />
  </Icon>
)
