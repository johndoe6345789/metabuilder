/**
 * Project Templates Page
 * Browse and select from pre-built project templates
 */

'use client';

import React from 'react';
import {
  Breadcrumbs,
  Box,
  Typography,
} from '@metabuilder/m3';
import {
  TemplateFilters as Filters,
  TemplateSidebar,
} from '@metabuilder/components/navigation';
import styles from '@scss/atoms/templates.module.scss';
import { useTemplatesPage } from './hooks/useTemplatesPage';
import TemplatesStats from './TemplatesStats';
import TemplatesContent from './TemplatesContent';

export default function TemplatesPage() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    setSelectedDifficulty,
    viewMode,
    setViewMode,
    allTemplates,
    categories,
    stats,
    filteredTemplates,
    resetFilters,
  } = useTemplatesPage();

  return (
    <Box className={styles.templatesPage}>
      <Breadcrumbs
        items={[
          { label: '🏠 Workspaces', href: '/' },
          { label: '📋 Templates', href: '/templates' },
        ]}
      />

      <Box className={styles.header}>
        <Box className={styles.headerContent}>
          <Typography variant="h3">
            Project Templates
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
          >
            Start with pre-built workflows and accelerate
            your projects
          </Typography>
          <TemplatesStats
            totalTemplates={stats.totalTemplates}
            totalDownloads={stats.totalDownloads}
            averageRating={stats.averageRating}
          />
        </Box>
      </Box>

      <Filters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        difficulty={selectedDifficulty}
        onDifficultyChange={setSelectedDifficulty}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <Box className={styles.mainLayout}>
        <TemplateSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          totalTemplates={allTemplates.length}
        />

        <TemplatesContent
          filteredTemplates={filteredTemplates}
          allTemplatesCount={allTemplates.length}
          viewMode={viewMode}
          onResetFilters={resetFilters}
        />
      </Box>
    </Box>
  );
}
