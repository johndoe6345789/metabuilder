/**
 * useDatabaseSettings - Composes config loading and DB actions
 */

'use client';

import { useState } from 'react';
import { useDatabaseConfig } from './useDatabaseConfig';
import { useDatabaseActions } from './useDatabaseActions';

export function useDatabaseSettings() {
  const { config, adapters, loading, fetchConfig, fetchAdapters } =
    useDatabaseConfig();

  const [selectedAdapter, setSelectedAdapter] =
    useState('postgres');
  const [formFields, setFormFields] = useState<
    Record<string, string>
  >({});

  const handleAdapterChange = (value: string) => {
    setSelectedAdapter(value);
    setFormFields({});
  };

  const handleFieldChange = (
    field: string,
    value: string
  ) => {
    setFormFields((prev) => ({ ...prev, [field]: value }));
  };

  const onApplySuccess = async () => {
    await fetchConfig();
    await fetchAdapters();
  };

  const {
    testing,
    switching,
    testResult,
    switchResult,
    defaultPorts,
    handleTestConnection,
    handleApply,
  } = useDatabaseActions({
    selectedAdapter,
    formFields,
    onApplySuccess,
  });

  return {
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
  };
}
