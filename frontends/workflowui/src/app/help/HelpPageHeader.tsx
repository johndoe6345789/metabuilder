/** HelpPageHeader - Title, icon, and search field */

'use client';

import React from 'react';
import { Box, Typography, TextField } from '@metabuilder/m3';
import {
  HelpIcon,
  SearchIcon,
} from '@/../../../icons/react';
import styles from '@/../../../scss/atoms/help.module.scss';

interface HelpPageHeaderProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
}

export default function HelpPageHeader({
  searchQuery,
  onSearchChange,
}: HelpPageHeaderProps) {
  return (
    <Box
      className={styles.pageHeader}
      data-testid="help-header"
    >
      <Box sx={{ display: 'flex', alignItems: 'center',
        gap: 2, mb: 2 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: 12,
          backgroundColor: 'var(--mat-sys-tertiary-container)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center' }}>
          <HelpIcon size={24} />
        </Box>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom={false}
          >
            Help &amp; Support
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Find answers to common questions
          </Typography>
        </Box>
      </Box>
      <TextField
        fullWidth
        placeholder="Search help topics..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: <SearchIcon size={20} />,
        }}
        sx={{ maxWidth: 600, mt: 2 }}
        data-testid="help-search"
      />
    </Box>
  );
}
