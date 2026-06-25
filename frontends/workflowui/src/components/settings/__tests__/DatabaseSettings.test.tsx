/**
 * Tests for DatabaseSettings component
 */

const mockUseDatabaseSettings = jest.fn();

jest.mock('../hooks/useDatabaseSettings', () => ({
  useDatabaseSettings: () => mockUseDatabaseSettings(),
}));

jest.mock('../CurrentDbCard', () => ({
  __esModule: true,
  default: ({ config }: any) => (
    <div data-testid="current-db-card">{config?.adapter || 'no-config'}</div>
  ),
}));

jest.mock('../SwitchDbCard', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="switch-db-card">
      <span>{props.selectedAdapter}</span>
    </div>
  ),
}));

jest.mock('../AvailableBackendsCard', () => ({
  __esModule: true,
  default: ({ adapters }: any) => (
    <div data-testid="available-backends">{adapters.length} adapters</div>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import DatabaseSettings from '../DatabaseSettings';

const makeSettings = (overrides = {}) => ({
  config: { adapter: 'sqlite', url: ':memory:' },
  adapters: [{ name: 'sqlite', active: true }],
  selectedAdapter: 'sqlite',
  formFields: {},
  loading: false,
  testing: false,
  switching: false,
  testResult: null,
  switchResult: null,
  defaultPorts: {},
  handleAdapterChange: jest.fn(),
  handleFieldChange: jest.fn(),
  handleTestConnection: jest.fn(),
  handleApply: jest.fn(),
  ...overrides,
});

describe('DatabaseSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDatabaseSettings.mockReturnValue(makeSettings());
  });

  it('renders loading message when loading', () => {
    mockUseDatabaseSettings.mockReturnValue(makeSettings({ loading: true }));
    render(<DatabaseSettings />);
    expect(screen.getByText(/loading database configuration/i)).toBeInTheDocument();
  });

  it('renders CurrentDbCard when not loading', () => {
    render(<DatabaseSettings />);
    expect(screen.getByTestId('current-db-card')).toBeInTheDocument();
  });

  it('renders SwitchDbCard when not loading', () => {
    render(<DatabaseSettings />);
    expect(screen.getByTestId('switch-db-card')).toBeInTheDocument();
  });

  it('renders AvailableBackendsCard when not loading', () => {
    render(<DatabaseSettings />);
    expect(screen.getByTestId('available-backends')).toBeInTheDocument();
  });

  it('passes adapter count to AvailableBackendsCard', () => {
    mockUseDatabaseSettings.mockReturnValue(makeSettings({
      adapters: [
        { name: 'sqlite', active: true },
        { name: 'postgres', active: false },
      ],
    }));
    render(<DatabaseSettings />);
    expect(screen.getByText('2 adapters')).toBeInTheDocument();
  });

  it('does not render main content when loading', () => {
    mockUseDatabaseSettings.mockReturnValue(makeSettings({ loading: true }));
    render(<DatabaseSettings />);
    expect(screen.queryByTestId('current-db-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('switch-db-card')).not.toBeInTheDocument();
  });
});
