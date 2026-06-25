vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/postgres' }));
vi.mock('@/utils/featureConfig', async () => ({
  getFeatureById: (id: string) => {
    if (id === 'column-management') {
      return {
        id: 'column-management',
        name: 'Column Management',
        ui: { actions: ['add', 'modify', 'delete'] },
      };
    }
    return undefined;
  },
  getDataTypes: () => [
    { name: 'INTEGER' },
    { name: 'VARCHAR' },
    { name: 'TEXT' },
  ],
  getQueryOperators: () => [],
  getIndexTypes: () => [],
  validateSqlParameter: () => null,
  validateSqlTemplateParams: () => null,
  getSqlParameterType: () => undefined,
  getSqlParameterTypes: () => ({}),
  getSqlQueryTemplate: () => undefined,
  getAllSqlTemplates: () => ({}),
  getSqlTemplatesByCategory: () => ({}),
  getValidationRule: () => undefined,
  getFormSchema: () => undefined,
  getApiEndpoints: () => undefined,
  getApiEndpoint: () => undefined,
  getPermissions: () => undefined,
  hasPermission: () => false,
  getRelationships: () => undefined,
  getUiViews: () => undefined,
  getUiView: () => undefined,
  getPlaywrightPlaybook: () => undefined,
  getAllPlaywrightPlaybooks: () => ({}),
  getPlaywrightPlaybooksByTag: () => [],
  getStorybookStory: () => undefined,
  getAllStorybookStories: () => ({}),
  getStorybookStoriesForComponent: () => ({}),
}));

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ColumnManagerTab from './ColumnManagerTab';

const tables = [
  { table_name: 'users' },
  { table_name: 'products' },
];

describe('ColumnManagerTab', () => {
  const defaultProps = {
    tables,
    onAddColumn: vi.fn(),
    onModifyColumn: vi.fn(),
    onDropColumn: vi.fn(),
  };

  it('should render without crashing', () => {
    const { container } = render(<ColumnManagerTab {...defaultProps} />);
    expect(container).toBeDefined();
  });

  it('should show the Column Management heading', () => {
    render(<ColumnManagerTab {...defaultProps} />);
    expect(screen.getAllByText(/Column Management/).length).toBeGreaterThan(0);
  });

  it('should show prompt to select a table when none is selected', () => {
    render(<ColumnManagerTab {...defaultProps} />);
    expect(
      screen.getAllByText(/Select a table/).length,
    ).toBeGreaterThan(0);
  });

  it('should render the table list', () => {
    render(<ColumnManagerTab {...defaultProps} />);
    expect(screen.getAllByText('users').length).toBeGreaterThan(0);
    expect(screen.getAllByText('products').length).toBeGreaterThan(0);
  });
});
