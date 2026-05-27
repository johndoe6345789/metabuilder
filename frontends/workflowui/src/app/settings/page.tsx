/**
 * Settings Page - User and application settings
 */

'use client';

import React from 'react';
import { Box } from '@metabuilder/fakemui';
import styles from '@/../../../scss/atoms/settings.module.scss';
import { useSettings } from './hooks/useSettings';
import SettingsTabsBar from './SettingsTabsBar';
import SettingsPageHeader from './SettingsPageHeader';
import SettingsTabsContent from './SettingsTabsContent';
import DeleteAccountDialog from './DeleteAccountDialog';

export default function SettingsPage() {
  const {
    activeTab,
    theme, setTheme,
    language, setLanguage,
    notifications, setNotifications,
    emailUpdates, setEmailUpdates,
    autoSave, setAutoSave,
    defaultExecutor, setDefaultExecutor,
    workflowTimeout, setWorkflowTimeout,
    deleteDialogOpen, setDeleteDialogOpen,
    saveSuccess, setSaveSuccess,
    handleTabChange,
    handleSavePreferences,
    handleDeleteAccount,
  } = useSettings();

  return (
    <Box
      className={styles.settingsPage}
      data-testid="settings-page"
    >
      <SettingsPageHeader
        saveSuccess={saveSuccess}
        onCloseSaveAlert={() => setSaveSuccess(false)}
      />

      <SettingsTabsBar
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      <SettingsTabsContent
        activeTab={activeTab}
        theme={theme} setTheme={setTheme}
        language={language} setLanguage={setLanguage}
        notifications={notifications}
        setNotifications={setNotifications}
        emailUpdates={emailUpdates}
        setEmailUpdates={setEmailUpdates}
        autoSave={autoSave} setAutoSave={setAutoSave}
        defaultExecutor={defaultExecutor}
        setDefaultExecutor={setDefaultExecutor}
        workflowTimeout={workflowTimeout}
        setWorkflowTimeout={setWorkflowTimeout}
        onDeleteClick={() => setDeleteDialogOpen(true)}
        onSave={handleSavePreferences}
      />

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </Box>
  );
}
