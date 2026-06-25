/**
 * useDatabaseActions - Test and apply database adapter changes
 */

'use client';

import { useState } from 'react';
import { DEFAULT_PORTS } from './dbUrlUtils';
import { testConnection, applyDbConfig } from './dbApiCalls';

interface TestResult {
  ok: boolean;
  message: string;
}

interface DatabaseActionsParams {
  selectedAdapter: string;
  formFields: Record<string, string>;
  onApplySuccess: () => Promise<void>;
}

export function useDatabaseActions({
  selectedAdapter,
  formFields,
  onApplySuccess,
}: DatabaseActionsParams) {
  const [testing, setTesting] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [testResult, setTestResult] =
    useState<TestResult | null>(null);
  const [switchResult, setSwitchResult] =
    useState<TestResult | null>(null);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testConnection(
        selectedAdapter,
        formFields
      );
      setTestResult(result);
    } catch (err) {
      setTestResult({
        ok: false,
        message:
          err instanceof Error
            ? err.message
            : 'Request failed',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleApply = async () => {
    setSwitching(true);
    setSwitchResult(null);
    try {
      const result = await applyDbConfig(
        selectedAdapter,
        formFields
      );
      setSwitchResult(result);
      if (result.ok) await onApplySuccess();
    } catch (err) {
      setSwitchResult({
        ok: false,
        message:
          err instanceof Error
            ? err.message
            : 'Request failed',
      });
    } finally {
      setSwitching(false);
    }
  };

  return {
    testing,
    switching,
    testResult,
    switchResult,
    defaultPorts: DEFAULT_PORTS,
    handleTestConnection,
    handleApply,
  };
}
