/**
 * SettingsTabsBar - Settings page tabs navigation
 */

'use client';

import React from 'react';
import { Box, Tabs, Tab } from '@metabuilder/fakemui';

const TABS = [
  { label: 'Preferences', panel: 0 },
  { label: 'Account', panel: 1 },
  { label: 'Workflows', panel: 2 },
  { label: 'Database', panel: 3 },
  { label: 'Danger Zone', panel: 4 },
];

interface SettingsTabsBarProps {
  activeTab: number;
  onChange: (e: any, v: number) => void;
}

export default function SettingsTabsBar({
  activeTab,
  onChange,
}: SettingsTabsBarProps) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Tabs
        value={activeTab}
        onChange={onChange}
        aria-label="settings tabs"
        data-testid="settings-tabs"
      >
        {TABS.map(({ label, panel }) => (
          <Tab
            key={panel}
            label={label}
            id={`settings-tab-${panel}`}
            aria-controls={`settings-tabpanel-${panel}`}
            data-testid={`tab-${label
              .toLowerCase()
              .replace(' ', '-')}`}
          />
        ))}
      </Tabs>
    </Box>
  );
}
