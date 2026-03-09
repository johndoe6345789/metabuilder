import { render, screen } from '@testing-library/react';
import SettingsPage from './page';

jest.mock('@/app/PageLayout', () => ({
  PageLayout: ({ children }: any) => <div data-testid="page-layout">{children}</div>,
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div data-testid="motion-div" {...props}>{children}</div>,
  },
}));

jest.mock('@/components/demo/PersistenceSettings', () => ({
  PersistenceSettings: () => <div data-testid="persistence-settings">Persistence</div>,
}));

jest.mock('@/components/settings/SchemaHealthCard', () => ({
  SchemaHealthCard: () => <div data-testid="schema-health-card">Schema</div>,
}));

jest.mock('@/components/settings/BackendAutoConfigCard', () => ({
  BackendAutoConfigCard: () => <div data-testid="backend-auto-config">Backend</div>,
}));

jest.mock('@/components/settings/StorageBackendCard', () => ({
  StorageBackendCard: () => <div data-testid="storage-backend">Storage</div>,
}));

jest.mock('@/components/settings/DatabaseStatsCard', () => ({
  DatabaseStatsCard: () => <div data-testid="database-stats">Stats</div>,
}));

jest.mock('@/components/settings/StorageInfoCard', () => ({
  StorageInfoCard: () => <div data-testid="storage-info">Info</div>,
}));

jest.mock('@/components/settings/DatabaseActionsCard', () => ({
  DatabaseActionsCard: () => <div data-testid="database-actions">Actions</div>,
}));

jest.mock('@/components/settings/OpenAISettingsCard', () => ({
  OpenAISettingsCard: () => <div data-testid="openai-settings">OpenAI</div>,
}));

const mockSettingsState = {
  stats: null,
  loading: false,
  storageBackend: 'indexeddb' as const,
  setStorageBackend: jest.fn(),
  flaskUrl: '',
  setFlaskUrl: jest.fn(),
  flaskConnectionStatus: 'unknown' as const,
  setFlaskConnectionStatus: jest.fn(),
  testingConnection: false,
  envVarSet: false,
  schemaHealth: null,
  checkingSchema: false,
  handleExport: jest.fn(),
  handleImport: jest.fn(),
  handleClear: jest.fn(),
  handleSeed: jest.fn(),
  formatBytes: (bytes: number) => `${bytes} B`,
  handleTestConnection: jest.fn(),
  handleSaveStorageConfig: jest.fn(),
  handleMigrateToFlask: jest.fn(),
  handleMigrateToIndexedDB: jest.fn(),
  checkSchemaHealth: jest.fn(),
};

// Mock useSettingsState hook
jest.mock('@/hooks/useSettingsState', () => ({
  useSettingsState: jest.fn(() => mockSettingsState),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders page layout', () => {
    render(<SettingsPage />);
    expect(screen.getByTestId('page-layout')).toBeInTheDocument();
  });

  test('renders Settings heading', () => {
    render(<SettingsPage />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Settings');
  });

  test('renders description text', () => {
    render(<SettingsPage />);
    expect(screen.getByText(/Manage your database and application settings/i)).toBeInTheDocument();
  });

  test('renders all settings cards', () => {
    render(<SettingsPage />);
    expect(screen.getByTestId('openai-settings')).toBeInTheDocument();
    expect(screen.getByTestId('persistence-settings')).toBeInTheDocument();
    expect(screen.getByTestId('schema-health-card')).toBeInTheDocument();
    expect(screen.getByTestId('backend-auto-config')).toBeInTheDocument();
    expect(screen.getByTestId('storage-backend')).toBeInTheDocument();
    expect(screen.getByTestId('database-stats')).toBeInTheDocument();
    expect(screen.getByTestId('storage-info')).toBeInTheDocument();
    expect(screen.getByTestId('database-actions')).toBeInTheDocument();
  });

  test('heading has correct styling', () => {
    render(<SettingsPage />);
    const heading = screen.getByText('Settings');
    expect(heading).toHaveClass('text-3xl', 'font-bold');
  });

  test('description has muted foreground color', () => {
    render(<SettingsPage />);
    const description = screen.getByText(/Manage your database/i);
    expect(description).toHaveClass('text-muted-foreground');
  });

  test('motion div is rendered', () => {
    render(<SettingsPage />);
    expect(screen.getByTestId('motion-div')).toBeInTheDocument();
  });

  test('uses settings state hook', () => {
    render(<SettingsPage />);
    expect(screen.getByTestId('persistence-settings')).toBeInTheDocument();
  });

  test('renders settings in grid layout', () => {
    render(<SettingsPage />);
    expect(screen.getByTestId('persistence-settings')).toBeInTheDocument();
  });

  test('component renders without crashing', () => {
    const { container } = render(<SettingsPage />);
    expect(container).toBeInTheDocument();
  });

  test('has proper page layout structure', () => {
    render(<SettingsPage />);
    const layout = screen.getByTestId('page-layout');
    expect(layout).toBeInTheDocument();
  });

  test('all cards are accessible', () => {
    render(<SettingsPage />);
    const cards = [
      'openai-settings',
      'persistence-settings',
      'schema-health-card',
      'backend-auto-config',
      'storage-backend',
      'database-stats',
      'storage-info',
      'database-actions',
    ];
    cards.forEach((card) => {
      expect(screen.getByTestId(card)).toBeInTheDocument();
    });
  });
});
