// components/layout/TemplateHeader.tsx

import React from 'react'
import { Box, Typography } from '../fakemui'
import { TemplateIcon } from '../cards/TemplateIcon'
import { TemplateDifficultyBadge } from '../feedback/TemplateDifficultyBadge'
import { TemplateRating } from '../feedback/TemplateRating'
import { Template } from '@metabuilder/interfaces/templates'
import styles from '../../scss/components/layout/template-header.module.scss'

interface TemplateHeaderProps {
  template: Template
  [key: string]: any
}

/**
 * Template detail header
 * Large icon, title, descriptions, and key metadata
 */
export const TemplateHeader = ({ template, ...rest }: TemplateHeaderProps) => {
  return (
    <Box component="header" className={styles.templateHeader} {...rest}>
      <Box className={styles.iconSection}>
        <TemplateIcon
          icon={template.icon}
          color={template.color}
          size="large"
        />
      </Box>

      <Box className={styles.content}>
        <Typography variant="h3" className={styles.title}>
          {template.name}
        </Typography>

        <Typography variant="body1" className={styles.description}>
          {template.description}
        </Typography>

        {template.longDescription && (
          <Typography variant="body2" className={styles.longDescription}>
            {template.longDescription}
          </Typography>
        )}

        <Box className={styles.metadata}>
          <Box className={styles.metaItem}>
            <Typography variant="caption" className={styles.metaLabel}>
              Difficulty
            </Typography>
            <TemplateDifficultyBadge difficulty={template.difficulty} />
          </Box>

          <Box className={styles.metaItem}>
            <Typography variant="caption" className={styles.metaLabel}>
              Workflows
            </Typography>
            <Typography className={styles.metaValue}>
              {template.workflows.length}
            </Typography>
          </Box>

          <Box className={styles.metaItem}>
            <Typography variant="caption" className={styles.metaLabel}>
              Rating
            </Typography>
            <TemplateRating rating={template.metadata.rating} />
          </Box>

          <Box className={styles.metaItem}>
            <Typography variant="caption" className={styles.metaLabel}>
              Downloads
            </Typography>
            <Typography className={styles.metaValue}>
              {template.metadata.downloads.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
