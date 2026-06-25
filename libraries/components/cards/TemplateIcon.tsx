// components/cards/TemplateIcon.tsx

import React from 'react'
import { Box } from '../fakemui'
import styles from '../../scss/components/cards/template-icon.module.scss'

interface TemplateIconProps {
  icon: string
  color: string
  size?: 'small' | 'medium' | 'large'
  [key: string]: any
}

/**
 * Template icon component
 * Displays template icon with background color
 */
export const TemplateIcon = ({
  icon,
  color,
  size = 'medium',
  ...rest
}: TemplateIconProps) => {
  const sizeClass = size === 'large' ? styles.large : size === 'small' ? styles.small : ''

  return (
    <Box
      className={`${styles.templateIcon} ${sizeClass}`}
      style={{ backgroundColor: color }}
      {...rest}
    >
      {icon}
    </Box>
  )
}
