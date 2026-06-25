/**
 * StatsGrid Component
 * Container for stat cards with dividers
 */

import React from 'react'
import { StatCard } from '../cards/StatCard'
import type { StatItem } from '@metabuilder/interfaces/dashboard'
import styles from '../../scss/components/layout/stats-grid.module.scss'

interface StatsGridProps {
  stats: StatItem[]
  dividerAfter?: number[]
  children?: React.ReactNode
  [key: string]: any
}

/**
 * StatsGrid - Layout for dashboard statistics
 */
export const StatsGrid = ({ stats, dividerAfter = [], children, ...rest }: StatsGridProps) => {
  return (
    <div className={styles.statsGrid} data-testid="stats-grid" {...rest}>
      {stats.map((stat, index) => (
        <React.Fragment key={index}>
          <StatCard stat={stat} />
          {dividerAfter.includes(index) && <div className={styles.divider} />}
        </React.Fragment>
      ))}
      {children}
    </div>
  )
}
