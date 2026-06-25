/**
 * AchievementLevelCard - Stat card showing current level
 */

'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
} from '@metabuilder/m3';
import styles from '@/../../../scss/atoms/mat-card.module.scss';

interface AchievementLevelCardProps {
  level: number;
  pointsToNextLevel: number;
}

export default function AchievementLevelCard({
  level,
  pointsToNextLevel,
}: AchievementLevelCardProps) {
  return (
    <Card
      className={styles['mat-card']}
      data-testid="level-card"
    >
      <CardContent>
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
        >
          <Avatar
            sx={{ width: 56, height: 56, fontSize: '2rem' }}
          >
            {level}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Current Level
            </Typography>
            <Typography variant="h5">
              Level {level}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {pointsToNextLevel} pts to next level
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
