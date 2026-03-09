/**
 * Settings Page - User and application settings
 */

'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  Alert,
  Dialog,
} from '@metabuilder/fakemui';
import { SettingsIcon, WarningIcon } from '@/../../../icons/react';
import styles from '@/../../../scss/atoms/settings.module.scss';

const DatabaseSettings = dynamic(
  () => import('@/components/settings/DatabaseSettings'),
  { ssr: false }
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
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

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [theme, setTheme] = useState('system');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [defaultExecutor, setDefaultExecutor] = useState('typescript');
  const [workflowTimeout, setWorkflowTimeout] = useState('300');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSavePreferences = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(false);
    // Account deletion logic would go here
  };

  return (
    <Box className={styles.settingsPage} data-testid="settings-page">
      {/* Page Header */}
      <Box className={styles.pageHeader} data-testid="settings-header">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: 'var(--mat-sys-secondary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SettingsIcon size={24} />
          </Box>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom={false}>
              Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure your preferences and application behavior
            </Typography>
          </Box>
        </Box>
      </Box>

      {saveSuccess && (
        <Alert severity="success" onClose={() => setSaveSuccess(false)} data-testid="save-success-alert">
          Settings saved successfully!
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="settings tabs" data-testid="settings-tabs">
          <Tab label="Preferences" id="settings-tab-0" aria-controls="settings-tabpanel-0" data-testid="tab-preferences" />
          <Tab label="Account" id="settings-tab-1" aria-controls="settings-tabpanel-1" data-testid="tab-account" />
          <Tab label="Workflows" id="settings-tab-2" aria-controls="settings-tabpanel-2" data-testid="tab-workflows" />
          <Tab label="Database" id="settings-tab-3" aria-controls="settings-tabpanel-3" data-testid="tab-database" />
          <Tab label="Danger Zone" id="settings-tab-4" aria-controls="settings-tabpanel-4" data-testid="tab-danger" />
        </Tabs>
      </Box>

      {/* Preferences Tab */}
      <TabPanel value={activeTab} index={0}>
        <Card data-testid="preferences-card">
          <CardHeader title="User Preferences" />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Theme Selection */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Theme
                </Typography>
                <Select
                  fullWidth
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  data-testid="theme-select"
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System Default</MenuItem>
                </Select>
                <Typography variant="caption" color="text.secondary">
                  Choose your preferred color scheme
                </Typography>
              </Box>

              {/* Language Selection */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Language
                </Typography>
                <Select
                  fullWidth
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  data-testid="language-select"
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="ja">日本語</MenuItem>
                </Select>
                <Typography variant="caption" color="text.secondary">
                  Select your preferred language
                </Typography>
              </Box>

              <Divider />

              {/* Notifications */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={notifications}
                      onChange={(e) => setNotifications(e.target.checked)}
                      data-testid="notifications-switch"
                    />
                  }
                  label="Enable notifications"
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                  Receive in-app notifications for workflow events
                </Typography>
              </Box>

              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={emailUpdates}
                      onChange={(e) => setEmailUpdates(e.target.checked)}
                      data-testid="email-updates-switch"
                    />
                  }
                  label="Email updates"
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                  Receive email notifications for important updates
                </Typography>
              </Box>
            </Box>
          </CardContent>
          <CardActions>
            <Button variant="contained" onClick={handleSavePreferences} data-testid="save-preferences-btn">
              Save Preferences
            </Button>
          </CardActions>
        </Card>
      </TabPanel>

      {/* Account Tab */}
      <TabPanel value={activeTab} index={1}>
        <Card data-testid="account-card">
          <CardHeader title="Account Settings" />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Email Address"
                type="email"
                defaultValue="user@example.com"
                helperText="Your email address for account notifications"
                fullWidth
                data-testid="email-input"
              />

              <TextField
                label="Display Name"
                defaultValue="Workflow User"
                helperText="Your name as it appears in the application"
                fullWidth
                data-testid="display-name-input"
              />

              <Divider />

              <Typography variant="subtitle1">Change Password</Typography>

              <TextField
                label="Current Password"
                type="password"
                fullWidth
                data-testid="current-password-input"
              />

              <TextField
                label="New Password"
                type="password"
                fullWidth
                data-testid="new-password-input"
              />

              <TextField
                label="Confirm New Password"
                type="password"
                fullWidth
                data-testid="confirm-password-input"
              />
            </Box>
          </CardContent>
          <CardActions>
            <Button variant="contained" data-testid="save-account-btn">
              Save Changes
            </Button>
          </CardActions>
        </Card>
      </TabPanel>

      {/* Workflows Tab */}
      <TabPanel value={activeTab} index={2}>
        <Card data-testid="workflows-card">
          <CardHeader title="Workflow Settings" />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Auto-save */}
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoSave}
                      onChange={(e) => setAutoSave(e.target.checked)}
                      data-testid="auto-save-switch"
                    />
                  }
                  label="Auto-save workflows"
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
                  Automatically save workflow changes every 30 seconds
                </Typography>
              </Box>

              <Divider />

              {/* Default Executor */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Default Executor
                </Typography>
                <Select
                  fullWidth
                  value={defaultExecutor}
                  onChange={(e) => setDefaultExecutor(e.target.value)}
                  data-testid="default-executor-select"
                >
                  <MenuItem value="typescript">TypeScript</MenuItem>
                  <MenuItem value="python">Python</MenuItem>
                  <MenuItem value="go">Go</MenuItem>
                  <MenuItem value="rust">Rust</MenuItem>
                  <MenuItem value="mojo">Mojo</MenuItem>
                </Select>
                <Typography variant="caption" color="text.secondary">
                  Default language for new workflow nodes
                </Typography>
              </Box>

              {/* Workflow Timeout */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Workflow Timeout (seconds)
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={workflowTimeout}
                  onChange={(e) => setWorkflowTimeout(e.target.value)}
                  helperText="Maximum execution time for workflows"
                  inputProps={{ min: 30, max: 3600 }}
                  data-testid="workflow-timeout-input"
                />
              </Box>
            </Box>
          </CardContent>
          <CardActions>
            <Button variant="contained" onClick={handleSavePreferences} data-testid="save-workflow-settings-btn">
              Save Settings
            </Button>
          </CardActions>
        </Card>
      </TabPanel>

      {/* Database Tab */}
      <TabPanel value={activeTab} index={3}>
        <DatabaseSettings />
      </TabPanel>

      {/* Danger Zone Tab */}
      <TabPanel value={activeTab} index={4}>
        <Card data-testid="danger-zone-card">
          <CardHeader
            title="Danger Zone"
            sx={{ backgroundColor: 'var(--mat-sys-error-container)' }}
          />
          <CardContent>
            <Alert severity="warning" icon={<WarningIcon />} sx={{ mb: 3 }}>
              Actions in this section cannot be undone. Please proceed with caution.
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1">Delete Account</Typography>
              <Typography variant="body2" color="text.secondary">
                Permanently delete your account and all associated data. This action cannot be reversed.
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                  data-testid="delete-account-btn"
                >
                  Delete Account
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        data-testid="delete-account-dialog"
      >
        <Box sx={{ p: 3 }}>
          <Typography id="delete-dialog-title" variant="h6" gutterBottom>
            Delete Account?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Are you sure you want to delete your account? This will permanently remove all your
            workspaces, workflows, and settings. This action cannot be undone.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={() => setDeleteDialogOpen(false)} data-testid="cancel-delete-btn">
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteAccount}
              data-testid="confirm-delete-btn"
            >
              Delete Permanently
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
