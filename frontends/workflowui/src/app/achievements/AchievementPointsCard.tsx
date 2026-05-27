/**
 * AchievementPointsCard - Stat card showing total points
 */

'use client';

import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
} from '@metabuilder/fakemui';
import styles from '@/../../../scss/atoms/mat-card.module.scss';

interface AchievementPointsCardProps {
  totalPoints: number;
  totalPossiblePoints: number;
}

export default function AchievementPointsCard({
  totalPoints,
  totalPossiblePoints,
}: AchievementPointsCardProps) {
  return (
    <Card
      className={styles['mat-card']}
      data-testid="points-card"
    >
      <CardContent>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1 }}
        >
          Total Points
        </Typography>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {totalPoints.toLocaleString()}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(totalPoints / totalPossiblePoints) * 100}
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          {totalPossiblePoints.toLocaleString()} total
          available
        </Typography>
      </CardContent>
    </Card>
  );
}
