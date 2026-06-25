/**
 * AchievementTabs - Tab bar for filtering achievements
 */

'use client';

import React from 'react';
import { Box, Tabs, Tab } from '@metabuilder/m3';

type TabValue = 'all' | 'unlocked' | 'locked';

interface AchievementTabsProps {
  selectedTab: TabValue;
  onTabChange: (value: TabValue) => void;
}

export default function AchievementTabs({
  selectedTab,
  onTabChange,
}: AchievementTabsProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => onTabChange(newValue)}
        data-testid="achievement-tabs"
      >
        <Tab label="All" value="all" />
        <Tab label="Unlocked" value="unlocked" />
        <Tab label="Locked" value="locked" />
      </Tabs>
    </Box>
  );
}
