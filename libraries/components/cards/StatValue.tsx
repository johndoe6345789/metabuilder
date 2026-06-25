/**
 * StatValue Component
 * Value and label display for stats
 */

import React from 'react'
import styles from '../../scss/components/cards/stat-value.module.scss'

interface StatValueProps {
  value: string | number
  label: string
  [key: string]: any
}

/**
 * StatValue - Displays stat value with label
 */
export const StatValue = ({ value, label, ...rest }: StatValueProps) => {
  return (
    <div className={styles.statValue} {...rest}>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  )
}
