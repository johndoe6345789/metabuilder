/**
 * TemplatesContent - Main content grid/list area for templates
 */

'use client';

import React from 'react';
import { Box, Button, Typography } from '@metabuilder/m3';
import {
  TemplateCard,
  TemplateListItem,
} from '@metabuilder/components/cards';
import styles from '@/../../../scss/atoms/templates.module.scss';

interface Template {
  id: string;
  [key: string]: unknown;
}

interface TemplatesContentProps {
  filteredTemplates: Template[];
  allTemplatesCount: number;
  viewMode: string;
  onResetFilters: () => void;
}

export default function TemplatesContent({
  filteredTemplates,
  allTemplatesCount,
  viewMode,
  onResetFilters,
}: TemplatesContentProps) {
  return (
    <Box
      component="main"
      role="main"
      className={styles.mainContent}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        className={styles.resultsCount}
      >
        Showing {filteredTemplates.length} of{' '}
        {allTemplatesCount} templates
      </Typography>

      {filteredTemplates.length === 0 ? (
        <Box className={styles.emptyState}>
          <Typography
            variant="h1"
            className={styles.emptyIcon}
          >
            🔍
          </Typography>
          <Typography variant="h5">
            No templates found
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
          >
            Try adjusting your filters or search query
          </Typography>
          <Button
            variant="contained"
            onClick={onResetFilters}
          >
            Reset Filters
          </Button>
        </Box>
      ) : (
        <>
          {viewMode === 'grid' && (
            <Box className={styles.gridView} role="list">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                />
              ))}
            </Box>
          )}
          {viewMode === 'list' && (
            <Box className={styles.listView} role="list">
              {filteredTemplates.map((template) => (
                <TemplateListItem
                  key={template.id}
                  template={template}
                />
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
