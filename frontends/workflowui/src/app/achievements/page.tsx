/**
 * Achievements Page - Gamification and user achievements
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
} from '@metabuilder/m3';
import { useAchievements } from './hooks/useAchievements';
import AchievementCard from './AchievementCard';
import AchievementStatsCards from './AchievementStatsCards';
import RecentUnlocked from './RecentUnlocked';
import AchievementTabs from './AchievementTabs';

export default function AchievementsPage() {
  const {
    selectedTab,
    setSelectedTab,
    totalPoints,
    totalPossiblePoints,
    level,
    pointsToNextLevel,
    filteredAchievements,
    recentUnlocked,
    formatDate,
    unlockedCount,
    totalCount,
  } = useAchievements();

  return (
    <Box sx={{ p: 3 }} data-testid="achievements-page">
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ mb: 1 }}
          data-testid="achievements-title"
        >
          Achievements
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your progress and unlock achievements
        </Typography>
      </Box>

      <AchievementStatsCards
        level={level}
        pointsToNextLevel={pointsToNextLevel}
        totalPoints={totalPoints}
        totalPossiblePoints={totalPossiblePoints}
        unlockedCount={unlockedCount}
        totalCount={totalCount}
      />

      <RecentUnlocked
        recentUnlocked={recentUnlocked as any}
        formatDate={formatDate}
      />

      <AchievementTabs
        selectedTab={selectedTab as any}
        onTabChange={setSelectedTab as any}
      />

      <Grid container spacing={3}>
        {filteredAchievements.map((achievement) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={achievement.id}
          >
            <AchievementCard
              achievement={achievement as any}
              formatDate={formatDate}
            />
          </Grid>
        ))}
      </Grid>

      {filteredAchievements.length === 0 && (
        <Box
          sx={{ textAlign: 'center', py: 8 }}
          data-testid="empty-state"
        >
          <Typography variant="h6" color="text.secondary">
            No achievements in this category
          </Typography>
        </Box>
      )}
    </Box>
  );
}
