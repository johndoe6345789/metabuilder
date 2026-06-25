// components/navigation/TemplateSidebar.tsx

import React from 'react'
import { Box, Button, Typography } from '../fakemui'
import { TemplateCategoryInfo, TemplateCategory } from '@metabuilder/interfaces/templates'
import styles from '../../scss/components/navigation/template-sidebar.module.scss'

interface TemplateSidebarProps {
  categories: TemplateCategoryInfo[]
  selectedCategory: TemplateCategory | 'all'
  onCategoryChange: (category: TemplateCategory | 'all') => void
  totalTemplates: number
  [key: string]: any
}

/**
 * Template sidebar navigation
 * Category filter with counts
 */
export const TemplateSidebar = ({
  categories,
  selectedCategory,
  onCategoryChange,
  totalTemplates,
  ...rest
}: TemplateSidebarProps) => {
  return (
    <Box
      component="aside"
      className={styles.templateSidebar}
      role="complementary"
      aria-label="Template categories"
      {...rest}
    >
      <Typography variant="h6" className={styles.heading}>
        Categories
      </Typography>

      <Button
        data-testid="template-all-categories"
        variant={selectedCategory === 'all' ? 'contained' : 'text'}
        onClick={() => onCategoryChange('all')}
        className={styles.categoryButton}
      >
        <span className={styles.categoryName}>All Templates</span>
        <span className={styles.categoryCount}>{totalTemplates}</span>
      </Button>

      {categories.map((cat) => (
        <Button
          key={cat.id}
          data-testid={`template-category-${cat.id}`}
          variant={selectedCategory === cat.id ? 'contained' : 'text'}
          onClick={() => onCategoryChange(cat.id as TemplateCategory)}
          className={styles.categoryButton}
        >
          <span className={styles.categoryIcon}>{cat.icon}</span>
          <span className={styles.categoryName}>{cat.name}</span>
          <span className={styles.categoryCount}>{cat.templateCount}</span>
        </Button>
      ))}
    </Box>
  )
}
