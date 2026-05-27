/**
 * SettingsTabPanel - Accessible tab panel wrapper
 */

'use client';

import React from 'react';
import { Box } from '@metabuilder/fakemui';

interface SettingsTabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export default function SettingsTabPanel({
  children,
  value,
  index,
}: SettingsTabPanelProps) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      sx={{ padding: 3 }}
      data-testid={`settings-tabpanel-${index}`}
    >
      {value === index && children}
    </Box>
  );
}
