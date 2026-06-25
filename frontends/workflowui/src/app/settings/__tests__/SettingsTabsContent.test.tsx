/**
 * Tests for SettingsTabsContent component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock next/dynamic to avoid SSR issues
jest.mock('next/dynamic', () => (fn: any) => {
  const Component = () => <div data-testid="database-settings-mock">Database Settings</div>;
  Component.displayName = 'DynamicDatabaseSettings';
  return Component;
});

import SettingsTabsContent from '../SettingsTabsContent';

const baseProps = {
  activeTab: 0,
  theme: 'system',
  setTheme: jest.fn(),
  language: 'en',
  setLanguage: jest.fn(),
  notifications: true,
  setNotifications: jest.fn(),
  emailUpdates: false,
  setEmailUpdates: jest.fn(),
  autoSave: true,
  setAutoSave: jest.fn(),
  defaultExecutor: 'typescript',
  setDefaultExecutor: jest.fn(),
  workflowTimeout: 300,
  setWorkflowTimeout: jest.fn(),
  onDeleteClick: jest.fn(),
  onSave: jest.fn(),
};

describe('SettingsTabsContent', () => {
  it('renders preferences tab content when activeTab is 0', () => {
    render(<SettingsTabsContent {...baseProps} activeTab={0} />);
    // PreferencesTab has the theme-select
    expect(screen.getByTestId('theme-select')).toBeInTheDocument();
  });

  it('renders account tab content when activeTab is 1', () => {
    render(<SettingsTabsContent {...baseProps} activeTab={1} />);
    expect(screen.getByTestId('account-card')).toBeInTheDocument();
  });

  it('renders workflows tab content when activeTab is 2', () => {
    render(<SettingsTabsContent {...baseProps} activeTab={2} />);
    expect(screen.getByTestId('workflows-card')).toBeInTheDocument();
  });

  it('renders database tab content when activeTab is 3', () => {
    render(<SettingsTabsContent {...baseProps} activeTab={3} />);
    expect(screen.getByTestId('database-settings-mock')).toBeInTheDocument();
  });

  it('renders danger zone content when activeTab is 4', () => {
    render(<SettingsTabsContent {...baseProps} activeTab={4} />);
    expect(screen.getByTestId('danger-zone-card')).toBeInTheDocument();
  });

  it('does not render other tabs when one is active', () => {
    render(<SettingsTabsContent {...baseProps} activeTab={0} />);
    expect(screen.queryByTestId('workflows-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('danger-zone-card')).not.toBeInTheDocument();
  });
});
