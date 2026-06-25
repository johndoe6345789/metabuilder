/**
 * ConnectionResultAlerts - Test/switch result alerts
 */

'use client';

import React from 'react';
import { Alert } from '@metabuilder/m3';

interface TestResult {
  ok: boolean;
  message: string;
}

interface ConnectionResultAlertsProps {
  testResult: TestResult | null;
  switchResult: TestResult | null;
}

export default function ConnectionResultAlerts({
  testResult,
  switchResult,
}: ConnectionResultAlertsProps) {
  return (
    <>
      {testResult && (
        <Alert
          severity={testResult.ok ? 'success' : 'error'}
          data-testid="test-result"
        >
          {testResult.message}
        </Alert>
      )}
      {switchResult && (
        <Alert
          severity={switchResult.ok ? 'success' : 'error'}
          data-testid="switch-result"
        >
          {switchResult.message}
        </Alert>
      )}
    </>
  );
}
