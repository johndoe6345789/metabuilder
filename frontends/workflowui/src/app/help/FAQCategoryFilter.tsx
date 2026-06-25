/**
 * FAQCategoryFilter - Category chip filters for FAQ section
 */

'use client';

import React from 'react';
import { Box, Chip } from '@metabuilder/m3';

interface FAQCategoryFilterProps {
  categories: string[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export default function FAQCategoryFilter({
  categories,
  searchQuery,
  setSearchQuery,
}: FAQCategoryFilterProps) {
  return (
    <Box
      sx={{
        mb: 2,
        display: 'flex',
        gap: 1,
        flexWrap: 'wrap',
      }}
    >
      <Chip
        label="All"
        onClick={() => setSearchQuery('')}
        color={searchQuery === '' ? 'primary' : 'default'}
        data-testid="filter-all"
      />
      {categories.map((category) => (
        <Chip
          key={category}
          label={category}
          onClick={() => setSearchQuery(category)}
          color={
            searchQuery === category ? 'primary' : 'default'
          }
          data-testid={`filter-${category
            .toLowerCase()
            .replace(/\s+/g, '-')}`}
        />
      ))}
    </Box>
  );
}
