/**
 * SettingsTabsContent - Renders the active settings tab panel
 */

'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import SettingsTabPanel from './SettingsTabPanel';
import PreferencesTab from './PreferencesTab';
import WorkflowsTab from './WorkflowsTab';
import AccountTab from './AccountTab';
import DangerZoneTab from './DangerZoneTab';

const DatabaseSettings = dynamic(
  () => import('@/components/settings/DatabaseSettings'),
  { ssr: false }
);

interface SettingsTabsContentProps {
  activeTab: number;
  theme: string;
  setTheme: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  notifications: boolean;
  setNotifications: (v: boolean) => void;
  emailUpdates: boolean;
  setEmailUpdates: (v: boolean) => void;
  autoSave: boolean;
  setAutoSave: (v: boolean) => void;
  defaultExecutor: string;
  setDefaultExecutor: (v: string) => void;
  workflowTimeout: number;
  setWorkflowTimeout: (v: number) => void;
  onDeleteClick: () => void;
  onSave: () => void;
}

export default function SettingsTabsContent({
  activeTab,
  theme, setTheme,
  language, setLanguage,
  notifications, setNotifications,
  emailUpdates, setEmailUpdates,
  autoSave, setAutoSave,
  defaultExecutor, setDefaultExecutor,
  workflowTimeout, setWorkflowTimeout,
  onDeleteClick, onSave,
}: SettingsTabsContentProps) {
  return (
    <>
      <SettingsTabPanel value={activeTab} index={0}>
        <PreferencesTab
          theme={theme} setTheme={setTheme}
          language={language} setLanguage={setLanguage}
          notifications={notifications}
          setNotifications={setNotifications}
          emailUpdates={emailUpdates}
          setEmailUpdates={setEmailUpdates}
          onSave={onSave}
        />
      </SettingsTabPanel>

      <SettingsTabPanel value={activeTab} index={1}>
        <AccountTab />
      </SettingsTabPanel>

      <SettingsTabPanel value={activeTab} index={2}>
        <WorkflowsTab
          autoSave={autoSave} setAutoSave={setAutoSave}
          defaultExecutor={defaultExecutor}
          setDefaultExecutor={setDefaultExecutor}
          workflowTimeout={workflowTimeout}
          setWorkflowTimeout={setWorkflowTimeout}
          onSave={onSave}
        />
      </SettingsTabPanel>

      <SettingsTabPanel value={activeTab} index={3}>
        <DatabaseSettings />
      </SettingsTabPanel>

      <SettingsTabPanel value={activeTab} index={4}>
        <DangerZoneTab onDeleteClick={onDeleteClick} />
      </SettingsTabPanel>
    </>
  );
}
