/**
 * AchievementStatsCards - Level, points, and unlocked stat cards
 */

'use client';

import React from 'react';
import { Grid } from '@metabuilder/m3';
import AchievementLevelCard from './AchievementLevelCard';
import AchievementPointsCard from './AchievementPointsCard';
import AchievementUnlockedCard from './AchievementUnlockedCard';

interface AchievementStatsCardsProps {
  level: number;
  pointsToNextLevel: number;
  totalPoints: number;
  totalPossiblePoints: number;
  unlockedCount: number;
  totalCount: number;
}

export default function AchievementStatsCards({
  level,
  pointsToNextLevel,
  totalPoints,
  totalPossiblePoints,
  unlockedCount,
  totalCount,
}: AchievementStatsCardsProps) {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={4}>
        <AchievementLevelCard
          level={level}
          pointsToNextLevel={pointsToNextLevel}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <AchievementPointsCard
          totalPoints={totalPoints}
          totalPossiblePoints={totalPossiblePoints}
        />
      </Grid>
      <Grid item xs={12} sm={4}>
        <AchievementUnlockedCard
          unlockedCount={unlockedCount}
          totalCount={totalCount}
        />
      </Grid>
    </Grid>
  );
}
