vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/postgres' }));
vi.mock('@/utils/featureConfig', async () => ({
  getFeatureById: (id: string) => {
    if (id === 'index-management') {
      return {
        id: 'index-management',
        name: 'Index Management',
        description: 'Manage database indexes',
        ui: { actions: ['create', 'delete'] },
      };
    }
    return undefined;
  },
  getIndexTypes: () => [
    { value: 'BTREE', label: 'B-Tree', description: 'Default' },
    { value: 'HASH', label: 'Hash', description: 'Hash-based' },
  ],
  getDataTypes: () => [],
  getQueryOperators: () => [],
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
vi.mock('@metabuilder/fakemui', async () => {
  const React = await import('react');
  const ConfirmDialog = ({ open }: any) =>
    open ? React.createElement('div', { 'data-testid': 'confirm-dialog' }) : null;
  return { ConfirmDialog };
});

import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import IndexManagerTab from './IndexManagerTab';

const tables = [
  { table_name: 'users' },
  { table_name: 'products' },
];

describe('IndexManagerTab', () => {
  const defaultProps = {
    tables,
    onRefresh: vi.fn(),
  };

  it('should render without crashing', () => {
    const { container } = render(<IndexManagerTab {...defaultProps} />);
    expect(container).toBeDefined();
  });

  it('should show the Index Management heading', () => {
    render(<IndexManagerTab {...defaultProps} />);
    expect(
      screen.getAllByText(/Index Management/).length,
    ).toBeGreaterThan(0);
  });

  it('should show the description text', () => {
    render(<IndexManagerTab {...defaultProps} />);
    expect(
      screen.getAllByText(/Manage database indexes/).length,
    ).toBeGreaterThan(0);
  });

  it('should render the table selector', () => {
    const { container } = render(<IndexManagerTab {...defaultProps} />);
    // IndexTableSelector renders a MUI Select (combobox)
    const combo = container.querySelector('[role="combobox"]');
    expect(combo).not.toBeNull();
  });
});
