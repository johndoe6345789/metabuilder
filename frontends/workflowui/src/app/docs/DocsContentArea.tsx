/**
 * DocsContentArea - Main content display for docs page
 */

'use client';

import React from 'react';
import { Box, Typography, Button } from '@metabuilder/m3';
import styles from '/atoms/docs.module.scss';

interface Section {
  id: string;
  title: string;
}

interface Category {
  id: string;
  title: string;
  sections: Section[];
}

interface DocsContentAreaProps {
  currentCategory: Category | undefined;
  currentSection: Section | undefined;
  isFirst: boolean;
}

export default function DocsContentArea({
  currentCategory,
  currentSection,
  isFirst,
}: DocsContentAreaProps) {
  return (
    <Box
      component="main"
      className={styles.mainContent}
      data-testid="docs-content"
    >
      <Box className={styles.contentHeader}>
        <Box className={styles.breadcrumbs}>
          <Typography variant="caption">
            {currentCategory?.title}
          </Typography>
          <Typography variant="caption">/</Typography>
          <Typography variant="caption">
            {currentSection?.title}
          </Typography>
        </Box>
        <Typography variant="h4">
          {currentSection?.title}
        </Typography>
      </Box>

      <Box className={styles.contentBody}>
        <Box className={styles.placeholder}>
          <Typography variant="h5" gutterBottom>
            📄 {currentSection?.title}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Documentation content for{' '}
            {currentSection?.title} will appear here.
          </Typography>
        </Box>
      </Box>

      <Box className={styles.navActions}>
        <Button
          variant="outlined"
          disabled={isFirst}
          data-testid="docs-previous"
        >
          ← Previous
        </Button>
        <Button
          variant="contained"
          data-testid="docs-next"
        >
          Next →
        </Button>
      </Box>
    </Box>
  );
}
