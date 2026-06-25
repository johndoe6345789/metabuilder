// components/feedback/TemplateDifficultyBadge.tsx

import React from 'react'
import { Box } from '../m3'
import styles from '../../scss/components/feedback/difficulty-badge.module.scss'

interface TemplateDifficultyBadgeProps {
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  [key: string]: any
}

const DIFFICULTY_CONFIG = {
  beginner: { icon: '🟢', label: 'Beginner' },
  intermediate: { icon: '🟡', label: 'Intermediate' },
  advanced: { icon: '🔴', label: 'Advanced' },
}

/**
 * Template difficulty badge
 * Shows difficulty level with colored icon
 */
export const TemplateDifficultyBadge = ({
  difficulty,
  ...rest
}: TemplateDifficultyBadgeProps) => {
  const config = DIFFICULTY_CONFIG[difficulty]

  return (
    <Box className={styles.difficultyBadge} {...rest}>
      <span className={styles.icon}>{config.icon}</span>
      <span>{config.label}</span>
    </Box>
  )
}
