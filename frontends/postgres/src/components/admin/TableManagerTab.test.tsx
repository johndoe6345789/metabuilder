vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/postgres' }));
vi.mock('@metabuilder/fakemui', async () => {
  const React = await import('react');
  const CreateTableDialog = ({ open }: any) => open ? React.createElement('div', { 'data-testid': 'create-table-dialog' }) : null;
  const DropTableDialog = ({ open }: any) => open ? React.createElement('div', { 'data-testid': 'drop-table-dialog' }) : null;
  return { CreateTableDialog, DropTableDialog };
});
vi.mock('@/utils/componentTreeRenderer', () => {
  return { default: () => null };
});
vi.mock('@/utils/featureConfig', async () => ({
  getFeatureById: (id: string) => {
    if (id === 'table-management') {
      return {
        id: 'table-management',
        name: 'Table Management',
        description: 'Manage database tables',
        ui: { actions: ['create', 'delete'] },
      };
    }
    return undefined;
  },
  getDataTypes: () => [
    { name: 'INTEGER' },
    { name: 'VARCHAR' },
  ],
  getComponentTree: () => null,
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
import TableManagerTab from './TableManagerTab';

const tables = [
  { table_name: 'users' },
  { table_name: 'products' },
];

describe('TableManagerTab', () => {
  const defaultProps = {
    tables,
    onCreateTable: vi.fn(),
    onDropTable: vi.fn(),
  };

  it('should render without crashing', () => {
    const { container } = render(<TableManagerTab {...defaultProps} />);
    expect(container).toBeDefined();
  });

  it('should show error message when component tree not found', () => {
    // getComponentTree returns null in our mock
    render(<TableManagerTab {...defaultProps} />);
    expect(
      screen.getAllByText(/Error: Component tree not found/).length,
    ).toBeGreaterThan(0);
  });
});
