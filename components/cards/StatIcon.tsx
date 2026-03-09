/**
 * StatIcon Component
 * Icon wrapper for stat cards
 */

import React from 'react'
import styles from '../../scss/components/cards/stat-icon.module.scss'

interface StatIconProps {
  icon: React.ReactNode
  color?: string
  [key: string]: any
}

/**
 * StatIcon - Displays an icon with styled background
 */
export const StatIcon = ({ icon, color, ...rest }: StatIconProps) => {
  return (
    <div className={styles.statIcon} style={color ? { color } : undefined} {...rest}>
      {icon}
    </div>
  )
}
