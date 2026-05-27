/**
 * useSettings - Settings page state and handlers
 */

'use client';

import { useState } from 'react';

export function useSettings() {
  const [activeTab, setActiveTab] = useState(0);
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [defaultExecutor, setDefaultExecutor] = useState(
    'typescript'
  );
  const [workflowTimeout, setWorkflowTimeout] = useState('300');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: number
  ) => {
    setActiveTab(newValue);
  };

  const handleSavePreferences = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(false);
  };

  return {
    activeTab,
    theme,
    setTheme,
    language,
    setLanguage,
    notifications,
    setNotifications,
    emailUpdates,
    setEmailUpdates,
    autoSave,
    setAutoSave,
    defaultExecutor,
    setDefaultExecutor,
    workflowTimeout,
    setWorkflowTimeout,
    deleteDialogOpen,
    setDeleteDialogOpen,
    saveSuccess,
    setSaveSuccess,
    handleTabChange,
    handleSavePreferences,
    handleDeleteAccount,
  };
}
