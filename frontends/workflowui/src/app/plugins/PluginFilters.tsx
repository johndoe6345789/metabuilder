/**
 * PluginFilters - Search, tab, and category filters for plugins
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
} from '@metabuilder/m3';
import styles from '@scss/atoms/plugins.module.scss';
import PluginCategoryButtons from './PluginCategoryButtons';

interface TabWithCount {
  id: string;
  label: string;
  count: number;
}

interface PluginFiltersProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedTab: string;
  setSelectedTab: (v: any) => void;
  selectedCategory: string | null;
  setSelectedCategory: (v: string | null) => void;
  tabsWithCounts: TabWithCount[];
  filteredCount: number;
  totalPlugins: number;
  onResetFilters: () => void;
}

export default function PluginFilters({
  searchQuery,
  setSearchQuery,
  selectedTab,
  setSelectedTab,
  selectedCategory,
  setSelectedCategory,
  tabsWithCounts,
  filteredCount,
  totalPlugins,
}: PluginFiltersProps) {
  return (
    <>
      <Box className={styles.filters}>
        <Box className={styles.searchBar}>
          <TextField
            fullWidth
            placeholder="Search plugins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="plugins-search"
          />
        </Box>

        <Box className={styles.filterGroup}>
          {tabsWithCounts.map((cat) => (
            <Button
              key={cat.id}
              variant={
                selectedTab === cat.id
                  ? 'contained'
                  : 'outlined'
              }
              onClick={() => setSelectedTab(cat.id)}
              data-testid={`plugin-tab-${cat.id}`}
            >
              {cat.label} ({cat.count})
            </Button>
          ))}
        </Box>

        <PluginCategoryButtons
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </Box>

      <Box className={styles.mainContent}>
        <Typography
          variant="body2"
          color="text.secondary"
          className={styles.resultsCount}
        >
          Showing {filteredCount} of {totalPlugins} plugins
        </Typography>
      </Box>
    </>
  );
}
