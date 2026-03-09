// components/navigation/TemplateFilters.tsx

import React from 'react'
import { Box, TextField, MenuItem, Button } from '../fakemui'
import styles from '../../scss/components/navigation/template-filters.module.scss'

interface TemplateFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  difficulty: 'all' | 'beginner' | 'intermediate' | 'advanced'
  onDifficultyChange: (difficulty: any) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  [key: string]: any
}

/**
 * Template filters component
 * Search, difficulty filter, and view mode toggle
 */
export const TemplateFilters = ({
  searchQuery,
  onSearchChange,
  difficulty,
  onDifficultyChange,
  viewMode,
  onViewModeChange,
  ...rest
}: TemplateFiltersProps) => {
  return (
    <Box className={styles.templateFilters} {...rest}>
      <Box className={styles.searchBox}>
        <TextField
          data-testid="template-search"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          fullWidth
        />
        <svg
          className={styles.searchIcon}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="11" cy="11" r="8" strokeWidth="2" />
          <path d="m21 21-4.35-4.35" strokeWidth="2" />
        </svg>
      </Box>

      <Box className={styles.filterRow}>
        <TextField
          select
          data-testid="template-difficulty"
          value={difficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          fullWidth
        >
          <MenuItem value="all">All Difficulty Levels</MenuItem>
          <MenuItem value="beginner">Beginner</MenuItem>
          <MenuItem value="intermediate">Intermediate</MenuItem>
          <MenuItem value="advanced">Advanced</MenuItem>
        </TextField>

        <Box className={styles.viewToggle}>
          <Button
            data-testid="template-grid-view"
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            onClick={() => onViewModeChange('grid')}
          >
            ⊞ Grid
          </Button>
          <Button
            data-testid="template-list-view"
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            onClick={() => onViewModeChange('list')}
          >
            ≡ List
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
