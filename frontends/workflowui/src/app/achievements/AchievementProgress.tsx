/**
 * AchievementProgress - Progress bar section for locked achievements
 */

'use client';

import React from 'react';
import { Box, Typography, LinearProgress } from '@metabuilder/m3';

interface AchievementProgressProps {
  progress: number;
  maxProgress: number;
}

export default function AchievementProgress({
  progress,
  maxProgress,
}: AchievementProgressProps) {
  if (maxProgress <= 1) return null;

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 0.5,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Progress
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {progress} / {maxProgress}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={(progress / maxProgress) * 100}
        sx={{ height: 6, borderRadius: 3 }}
      />
    </Box>
  );
}
