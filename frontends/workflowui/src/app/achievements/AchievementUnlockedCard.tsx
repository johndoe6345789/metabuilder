/**
 * AchievementUnlockedCard - Stat card showing achievements unlocked
 */

'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
} from '@metabuilder/m3';
import styles from '@scss/atoms/mat-card.module.scss';

interface AchievementUnlockedCardProps {
  unlockedCount: number;
  totalCount: number;
}

export default function AchievementUnlockedCard({
  unlockedCount,
  totalCount,
}: AchievementUnlockedCardProps) {
  return (
    <Card
      className={styles['mat-card']}
      data-testid="unlocked-card"
    >
      <CardContent>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          Achievements Unlocked
        </Typography>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {unlockedCount} / {totalCount}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(unlockedCount / totalCount) * 100}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </CardContent>
    </Card>
  );
}
