/**
 * AchievementCardHeader - Icon, title, points and unlock badge
 */

'use client';

import React from 'react';
import { Box, Typography, Chip, Avatar } from '@metabuilder/fakemui';

interface AchievementCardHeaderProps {
  icon: string;
  title: string;
  points: number;
  unlocked: boolean;
}

export default function AchievementCardHeader({
  icon,
  title,
  points,
  unlocked,
}: AchievementCardHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        mb: 2,
      }}
    >
      <Avatar
        sx={{
          width: 56,
          height: 56,
          fontSize: '2rem',
          bgcolor: unlocked
            ? 'primary.main'
            : 'action.disabledBackground',
        }}
      >
        {icon}
      </Avatar>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {title}
        </Typography>
        <Chip
          label={`${points} pts`}
          size="small"
          color={unlocked ? 'primary' : 'default'}
        />
      </Box>
      {unlocked && (
        <Chip label="✓" color="success" size="small" />
      )}
    </Box>
  );
}
