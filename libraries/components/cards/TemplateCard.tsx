// components/cards/TemplateCard.tsx

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardActions, Button, Box, Typography } from '../fakemui'
import { TemplateIcon } from './TemplateIcon'
import { TemplateDifficultyBadge } from '../feedback/TemplateDifficultyBadge'
import { TemplateRating } from '../feedback/TemplateRating'
import { Template } from '@metabuilder/interfaces/templates'
import styles from '../../scss/components/cards/template-card.module.scss'

interface TemplateCardProps {
  template: Template
  [key: string]: any
}

/**
 * Template card component - Grid view
 * Displays template summary with icon, metadata, and actions
 */
export const TemplateCard = ({ template, ...rest }: TemplateCardProps) => {
  return (
    <Card
      className={styles.templateCard}
      data-testid={`template-card-${template.id}`}
      role="listitem"
      {...rest}
    >
      {template.metadata.featured && (
        <Box className={styles.featuredBadge} aria-label="Featured">
          ⭐ Featured
        </Box>
      )}

      <TemplateIcon
        icon={template.icon}
        color={template.color}
        size="large"
      />

      <CardContent className={styles.content}>
        <Typography variant="h6" className={styles.title}>
          {template.name}
        </Typography>

        <Typography variant="body2" className={styles.description}>
          {template.description}
        </Typography>

        <Box className={styles.metadata}>
          <TemplateDifficultyBadge difficulty={template.difficulty} />
          <Box className={styles.metaItem}>
            {template.workflows.length} workflow{template.workflows.length !== 1 ? 's' : ''}
          </Box>
        </Box>

        <Box className={styles.stats}>
          <TemplateRating rating={template.metadata.rating} />
          <Box className={styles.downloads}>
            ⬇️ {template.metadata.downloads?.toLocaleString() || 0}
          </Box>
        </Box>
      </CardContent>

      <CardActions>
        <Button
          component={Link}
          href={`/templates/${template.id}`}
          variant="contained"
          fullWidth
        >
          View Template
        </Button>
      </CardActions>
    </Card>
  )
}
