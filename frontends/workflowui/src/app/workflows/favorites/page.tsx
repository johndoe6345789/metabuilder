/** Favorite Workflows Page - Starred/bookmarked workflows */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
} from '@metabuilder/fakemui';
import styles from '@/../../../scss/atoms/mat-card.module.scss';
import { useFavorites } from './hooks/useFavorites';
import FavoriteWorkflowItem from './FavoriteWorkflowItem';
import FavoriteWorkflowFilters from './FavoriteWorkflowFilters';
import FavoritesLoadingState from './FavoritesLoadingState';

export default function FavoriteWorkflowsPage() {
  const {
    workflows, isLoading, searchQuery, setSearchQuery,
    sortBy, setSortBy, handleDelete, formatLastUpdated,
  } = useFavorites();

  if (isLoading && workflows.length === 0) {
    return <FavoritesLoadingState />;
  }

  return (
    <Box sx={{ p: 3 }} data-testid="favorites-page">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1 }}
          data-testid="favorites-title">
          Workflows
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your workflows (favorites feature coming soon)
        </Typography>
      </Box>
      <FavoriteWorkflowFilters
        searchQuery={searchQuery}
        sortBy={sortBy}
        setSearchQuery={setSearchQuery}
        setSortBy={setSortBy}
      />
      {workflows.length === 0 ? (
        <Card className={styles['mat-card']}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {searchQuery
                  ? 'No workflows match your search'
                  : 'No workflows yet'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column',
          gap: 2 }}>
          {workflows.map((workflow) => (
            <FavoriteWorkflowItem
              key={workflow.id}
              workflow={workflow}
              onDelete={handleDelete}
              formatLastUpdated={formatLastUpdated}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
