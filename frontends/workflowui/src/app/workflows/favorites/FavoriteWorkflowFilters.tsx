/**
 * FavoriteWorkflowFilters - Search and sort controls for favorites
 */

'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@metabuilder/m3';
import styles from '@/../../../scss/atoms/mat-card.module.scss';

interface FavoriteWorkflowFiltersProps {
  searchQuery: string;
  sortBy: 'name' | 'updatedAt';
  setSearchQuery: (v: string) => void;
  setSortBy: (v: 'name' | 'updatedAt') => void;
}

export default function FavoriteWorkflowFilters({
  searchQuery,
  sortBy,
  setSearchQuery,
  setSortBy,
}: FavoriteWorkflowFiltersProps) {
  return (
    <Card className={styles['mat-card']} sx={{ mb: 3 }}>
      <CardContent>
        <Box
          sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}
        >
          <TextField
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: '1 1 300px', minWidth: 200 }}
            data-testid="search-input"
          />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) =>
                setSortBy(
                  e.target.value as 'name' | 'updatedAt'
                )
              }
            >
              <MenuItem value="updatedAt">
                Last Updated
              </MenuItem>
              <MenuItem value="name">Name</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </CardContent>
    </Card>
  );
}
