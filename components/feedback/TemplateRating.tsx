// components/feedback/TemplateRating.tsx

import React from 'react'
import { Box } from '../fakemui'
import styles from '../../scss/components/feedback/template-rating.module.scss'

interface TemplateRatingProps {
  rating: number
  showScore?: boolean
  [key: string]: any
}

/**
 * Template rating component
 * Displays star rating with optional numeric score
 */
export const TemplateRating = ({
  rating,
  showScore = true,
  ...rest
}: TemplateRatingProps) => {
  const stars = '⭐'.repeat(Math.round(rating || 0))
  const score = rating ? rating.toFixed(1) : 'N/A'

  return (
    <Box
      className={styles.templateRating}
      aria-label={`Rating ${rating} out of 5`}
      {...rest}
    >
      <span className={styles.stars}>{stars}</span>
      {showScore && <span className={styles.score}>{score}</span>}
    </Box>
  )
}
