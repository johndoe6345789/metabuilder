/**
 * WorkflowFilters - Search and filter controls for workflows list
 */

'use client';

import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@metabuilder/m3';
import { SearchIcon } from '@/../../../icons/react';
import FILTER_OPTIONS from './workflow-filters.json';

interface WorkflowFiltersProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
}

export default function WorkflowFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
}: WorkflowFiltersProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
        <TextField
          placeholder="Search workflows..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          startAdornment={<SearchIcon size={20} />}
        />
      </div>
      <FormControl style={{ minWidth: '150px' }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          label="Status"
        >
          {FILTER_OPTIONS.statuses.map((s) => (
            <MenuItem key={s.value} value={s.value}>
              {s.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl style={{ minWidth: '150px' }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          label="Category"
        >
          {FILTER_OPTIONS.categories.map((c) => (
            <MenuItem key={c.value} value={c.value}>
              {c.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
