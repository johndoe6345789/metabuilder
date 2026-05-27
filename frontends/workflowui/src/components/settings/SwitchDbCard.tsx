/** SwitchDbCard - Form to switch to a different database adapter */

'use client';

import React from 'react';
import {
  Box, Button, Card, CardContent,
  CardHeader, CardActions, Divider,
} from '@metabuilder/fakemui';
import DB_CONFIG from './database-config.json';
import DbAdapterFields from './DbAdapterFields';
import AdapterSelector from './AdapterSelector';
import ConnectionResultAlerts from './ConnectionResultAlerts';
import type { SwitchDbCardProps } from './switchDbTypes';

export default function SwitchDbCard({
  selectedAdapter, formFields, testing, switching,
  testResult, switchResult, defaultPorts,
  onAdapterChange, onFieldChange,
  onTestConnection, onApply,
}: SwitchDbCardProps) {
  const fields =
    DB_CONFIG.adapterFields[
      selectedAdapter as keyof typeof DB_CONFIG.adapterFields
    ] || [];

  return (
    <Card data-testid="switch-db-card">
      <CardHeader title="Switch Database" />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column',
          gap: 3 }}>
          <AdapterSelector
            selectedAdapter={selectedAdapter}
            onAdapterChange={onAdapterChange}
          />
          <Divider />
          <DbAdapterFields
            fields={fields}
            formFields={formFields}
            selectedAdapter={selectedAdapter}
            defaultPorts={defaultPorts}
            onFieldChange={onFieldChange}
          />
          <ConnectionResultAlerts
            testResult={testResult}
            switchResult={switchResult}
          />
        </Box>
      </CardContent>
      <CardActions>
        <Button
          variant="outlined"
          onClick={onTestConnection}
          disabled={testing}
          data-testid="test-connection-btn"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </Button>
        <Button
          variant="contained"
          onClick={onApply}
          disabled={switching}
          data-testid="apply-db-btn"
        >
          {switching ? 'Switching...' : 'Apply'}
        </Button>
      </CardActions>
    </Card>
  );
}
