/**
 * StatCard Component
 * Individual stat card with icon and value
 */

import React from 'react'
import { StatIcon } from './StatIcon'
import { StatValue } from './StatValue'
import type { StatItem } from '@metabuilder/interfaces/dashboard'
import styles from '../../scss/components/cards/stat-card.module.scss'

interface StatCardProps {
  stat: StatItem
  [key: string]: any
}

/**
 * StatCard - Composed stat display (icon + value)
 */
export const StatCard = ({ stat, ...rest }: StatCardProps) => {
  const className = stat.warning ? `${styles.statCard} ${styles.warning}` : styles.statCard

  return (
    <div className={className} {...rest}>
      <StatIcon icon={stat.icon} color={stat.color} />
      <StatValue value={stat.value} label={stat.label} />
    </div>
  )
}
