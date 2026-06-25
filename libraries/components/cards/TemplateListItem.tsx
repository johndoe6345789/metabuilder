// components/cards/TemplateListItem.tsx

import React from 'react'
import Link from 'next/link'
import { Box, Typography, Button } from '../fakemui'
import { TemplateIcon } from './TemplateIcon'
import { Template } from '@metabuilder/interfaces/templates'
import styles from '../../scss/components/cards/template-list-item.module.scss'

interface TemplateListItemProps {
  template: Template
  [key: string]: any
}

/**
 * Template list item component - List view
 * Compact horizontal layout with tags
 */
export const TemplateListItem = ({ template, ...rest }: TemplateListItemProps) => {
  const visibleTags = template.tags.slice(0, 3)
  const remainingCount = template.tags.length - 3

  return (
    <Box
      className={styles.templateListItem}
      data-testid={`template-list-item-${template.id}`}
      role="listitem"
      {...rest}
    >
      <TemplateIcon
        icon={template.icon}
        color={template.color}
        size="small"
      />

      <Box className={styles.content}>
        <Box className={styles.header}>
          <Typography variant="h6" className={styles.title}>
            {template.name}
          </Typography>
          {template.metadata.featured && (
            <Box className={styles.featuredBadge}>⭐ Featured</Box>
          )}
        </Box>

        <Typography variant="body2" className={styles.description}>
          {template.description}
        </Typography>

        <Box className={styles.tags}>
          {visibleTags.map((tag) => (
            <Box key={tag} className={styles.tag}>
              {tag}
            </Box>
          ))}
          {remainingCount > 0 && (
            <Box className={styles.tag}>+{remainingCount}</Box>
          )}
        </Box>
      </Box>

      <Box className={styles.actions}>
        <Button
          component={Link}
          href={`/templates/${template.id}`}
          variant="outlined"
        >
          View
        </Button>
      </Box>
    </Box>
  )
}
