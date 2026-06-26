import React from 'react'
import { Icon, IconProps } from './Icon'

export const Pagination = (props: IconProps) => (
  <Icon {...props}>
    <rect x="32" y="96" width="48" height="64" rx="8" />
    <rect x="96" y="96" width="64" height="64" rx="8" fill="currentColor" fillOpacity="0.2" />
    <text x="118" y="140" fontSize="36" fontFamily="sans-serif" fill="currentColor" stroke="none">2</text>
    <rect x="176" y="96" width="48" height="64" rx="8" />
    <polyline points="48,120 56,128 48,136" />
    <polyline points="208,120 200,128 208,136" />
  </Icon>
)

export default Pagination
