/** FavoritesLoadingState - Centered loading spinner */

'use client';

import React from 'react';
import { Box, CircularProgress } from '@metabuilder/m3';

export default function FavoritesLoadingState() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center',
      alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );
}
