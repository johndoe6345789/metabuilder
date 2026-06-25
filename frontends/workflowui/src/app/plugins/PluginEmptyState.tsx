/**
 * PluginEmptyState - Empty state when no plugins match filters
 */

'use client';

import React from 'react';
import { Box, Button, Typography } from '@metabuilder/m3';
import styles from '/atoms/plugins.module.scss';

interface PluginEmptyStateProps {
  onResetFilters: () => void;
}

export default function PluginEmptyState({
  onResetFilters,
}: PluginEmptyStateProps) {
  return (
    <Box className={styles.emptyState}>
      <Typography variant="h1" className={styles.emptyIcon}>
        🔍
      </Typography>
      <Typography variant="h5">No plugins found</Typography>
      <Typography variant="body1" color="text.secondary">
        Try adjusting your filters or search query
      </Typography>
      <Button variant="contained" onClick={onResetFilters}>
        Reset Filters
      </Button>
    </Box>
  );
}
