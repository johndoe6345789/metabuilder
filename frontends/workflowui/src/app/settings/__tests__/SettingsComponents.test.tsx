/**
 * Tests for settings page components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SettingsPageHeader from '../SettingsPageHeader';
import SettingsTabPanel from '../SettingsTabPanel';
import SettingsTabsBar from '../SettingsTabsBar';

// ── SettingsPageHeader ───────────────────────────────────────────────────────
describe('SettingsPageHeader', () => {
  it('renders the settings header', () => {
    render(
      <SettingsPageHeader saveSuccess={false} onCloseSaveAlert={jest.fn()} />
    );
    expect(screen.getByTestId('settings-header')).toBeInTheDocument();
  });

  it('renders "Settings" title', () => {
    render(
      <SettingsPageHeader saveSuccess={false} onCloseSaveAlert={jest.fn()} />
    );
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('does not render success alert when saveSuccess is false', () => {
    render(
      <SettingsPageHeader saveSuccess={false} onCloseSaveAlert={jest.fn()} />
    );
    expect(
      screen.queryByTestId('save-success-alert')
    ).not.toBeInTheDocument();
  });

  it('renders success alert when saveSuccess is true', () => {
    render(
      <SettingsPageHeader saveSuccess onCloseSaveAlert={jest.fn()} />
    );
    expect(screen.getByTestId('save-success-alert')).toBeInTheDocument();
    expect(
      screen.getByText('Settings saved successfully!')
    ).toBeInTheDocument();
  });

  it('calls onCloseSaveAlert when alert Close is clicked', async () => {
    const onClose = jest.fn();
    render(<SettingsPageHeader saveSuccess onCloseSaveAlert={onClose} />);
    await userEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ── SettingsTabPanel ─────────────────────────────────────────────────────────
describe('SettingsTabPanel', () => {
  it('renders children when value matches index', () => {
    render(
      <SettingsTabPanel value={2} index={2}>
        <div>Panel content</div>
      </SettingsTabPanel>
    );
    expect(screen.getByText('Panel content')).toBeInTheDocument();
  });

  it('hides children when value does not match index', () => {
    render(
      <SettingsTabPanel value={0} index={2}>
        <div>Hidden content</div>
      </SettingsTabPanel>
    );
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });

  it('renders with correct data-testid', () => {
    render(<SettingsTabPanel value={1} index={1} />);
    expect(
      screen.getByTestId('settings-tabpanel-1')
    ).toBeInTheDocument();
  });

  it('has role="tabpanel"', () => {
    render(<SettingsTabPanel value={0} index={0} />);
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
  });
});

// ── SettingsTabsBar ──────────────────────────────────────────────────────────
describe('SettingsTabsBar', () => {
  it('renders the settings tabs', () => {
    render(<SettingsTabsBar activeTab={0} onChange={jest.fn()} />);
    expect(screen.getByTestId('settings-tabs')).toBeInTheDocument();
  });

  it('renders all five tab labels', () => {
    render(<SettingsTabsBar activeTab={0} onChange={jest.fn()} />);
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Workflows')).toBeInTheDocument();
    expect(screen.getByText('Database')).toBeInTheDocument();
    expect(screen.getByText('Danger Zone')).toBeInTheDocument();
  });

  it('renders five tab buttons', () => {
    render(<SettingsTabsBar activeTab={0} onChange={jest.fn()} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(5);
  });
});
