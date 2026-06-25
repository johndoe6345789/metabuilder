/**
 * DatabaseSettings - Runtime database configuration panel
 */

'use client';

import React from 'react';
import { Box, Typography } from '@metabuilder/m3';
import { useDatabaseSettings } from './hooks/useDatabaseSettings';
import CurrentDbCard from './CurrentDbCard';
import SwitchDbCard from './SwitchDbCard';
import AvailableBackendsCard from './AvailableBackendsCard';

export default function DatabaseSettings() {
  const {
    config,
    adapters,
    selectedAdapter,
    formFields,
    loading,
    testing,
    switching,
    testResult,
    switchResult,
    defaultPorts,
    handleAdapterChange,
    handleFieldChange,
    handleTestConnection,
    handleApply,
  } = useDatabaseSettings();

  if (loading) {
    return (
      <Box
        sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
      >
        <Typography variant="body2" color="text.secondary">
          Loading database configuration...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
    >
      <CurrentDbCard config={config} />

      <SwitchDbCard
        selectedAdapter={selectedAdapter}
        formFields={formFields}
        testing={testing}
        switching={switching}
        testResult={testResult}
        switchResult={switchResult}
        defaultPorts={defaultPorts}
        onAdapterChange={handleAdapterChange}
        onFieldChange={handleFieldChange}
        onTestConnection={handleTestConnection}
        onApply={handleApply}
      />

      <AvailableBackendsCard adapters={adapters} />
    </Box>
  );
}
