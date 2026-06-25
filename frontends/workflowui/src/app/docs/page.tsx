/**
 * Docs Page - Documentation and guides
 */

'use client';

import React from 'react';
import {
  Breadcrumbs,
  Box,
  Typography,
  TextField,
} from '@metabuilder/m3';
import styles from '@/../../../scss/atoms/docs.module.scss';
import { useDocs } from './hooks/useDocs';
import DocsSidebar from './DocsSidebar';
import DocsContentArea from './DocsContentArea';
import DocsToc from './DocsToc';

export default function DocsPage() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    selectedSection,
    activeTocItem,
    setActiveTocItem,
    currentCategory,
    currentSection,
    navigate,
    categories,
  } = useDocs();

  const isFirst =
    selectedCategory === 'getting-started' &&
    selectedSection === 'intro';

  return (
    <Box className={styles.docsPage} data-testid="docs-page">
      <Breadcrumbs
        items={[
          { label: '🏠 Workspaces', href: '/' },
          { label: '📚 Documentation', href: '/docs' },
        ]}
      />

      <Box className={styles.header}>
        <Typography variant="h3" data-testid="docs-title">
          Documentation
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Learn how to build powerful workflows
        </Typography>
        <Box className={styles.searchBar}>
          <TextField
            fullWidth
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="docs-search"
          />
        </Box>
      </Box>

      <Box className={styles.mainLayout}>
        <DocsSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          selectedSection={selectedSection}
          navigate={navigate}
        />

        <DocsContentArea
          currentCategory={currentCategory}
          currentSection={currentSection}
          isFirst={isFirst}
        />

        <DocsToc
          activeTocItem={activeTocItem}
          setActiveTocItem={setActiveTocItem}
        />
      </Box>
    </Box>
  );
}
