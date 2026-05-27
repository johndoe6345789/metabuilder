/**
 * CanvasLoadingState - Loading spinner for project canvas page
 */

'use client';

import React from 'react';
import {
  Box as BoxComp,
  CircularProgress as CircularProgressComp,
  Typography as TypographyComp,
} from '@metabuilder/fakemui';

const Box = BoxComp as any;
const CircularProgress = CircularProgressComp as any;
const Typography = TypographyComp as any;

export default function CanvasLoadingState() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="textSecondary">
        Loading project canvas...
      </Typography>
    </Box>
  );
}
