/**
 * AdapterSelector - Adapter dropdown for SwitchDbCard
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
} from '@metabuilder/m3';
import DB_CONFIG from './database-config.json';

interface AdapterSelectorProps {
  selectedAdapter: string;
  onAdapterChange: (adapter: string) => void;
}

export default function AdapterSelector({
  selectedAdapter,
  onAdapterChange,
}: AdapterSelectorProps) {
  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Adapter
      </Typography>
      <Select
        fullWidth
        value={selectedAdapter}
        onChange={(e) => onAdapterChange(e.target.value)}
        data-testid="adapter-select"
      >
        {DB_CONFIG.adapters.map((a) => (
          <MenuItem key={a.value} value={a.value}>
            {a.label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
