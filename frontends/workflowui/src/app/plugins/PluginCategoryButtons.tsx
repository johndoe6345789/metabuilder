/**
 * PluginCategoryButtons - Category filter buttons row for plugins
 */

'use client';

import React from 'react';
import { Box, Button } from '@metabuilder/m3';
import styles from '@/../../../scss/atoms/plugins.module.scss';
import CATEGORIES from './plugin-categories.json';

interface PluginCategoryButtonsProps {
  selectedCategory: string | null;
  onCategoryChange: (id: string | null) => void;
}

export default function PluginCategoryButtons({
  selectedCategory,
  onCategoryChange,
}: PluginCategoryButtonsProps) {
  return (
    <Box className={styles.filterGroup}>
      <Button
        variant={
          selectedCategory === null ? 'contained' : 'outlined'
        }
        onClick={() => onCategoryChange(null)}
        size="small"
        data-testid="category-all"
      >
        All Categories
      </Button>
      {CATEGORIES.categoryFilters.map((cat) => (
        <Button
          key={cat.id}
          variant={
            selectedCategory === cat.id
              ? 'contained'
              : 'outlined'
          }
          onClick={() => onCategoryChange(cat.id)}
          size="small"
          data-testid={`category-${cat.id}`}
        >
          {cat.label}
        </Button>
      ))}
    </Box>
  );
}
