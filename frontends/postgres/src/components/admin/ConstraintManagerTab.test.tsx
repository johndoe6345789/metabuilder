vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/postgres' }));
vi.mock('@metabuilder/fakemui', async () => {
  const React = await import('react');
  const ConstraintDialog = ({ open }: any) => open ? React.createElement('div', { 'data-testid': 'constraint-dialog' }) : null;
  const ConfirmDialog = ({ open }: any) => open ? React.createElement('div', { 'data-testid': 'confirm-dialog' }) : null;
  return { ConstraintDialog, ConfirmDialog };
});
vi.mock('@/utils/featureConfig', async () => ({
  getFeatureById: (id: string) => {
    if (id === 'constraint-management') {
      return {
        id: 'constraint-management',
        name: 'Constraint Manager',
        description: 'Manage table constraints',
        ui: { actions: ['add', 'delete'] },
      };
    }
    return undefined;
  },
  getConstraintTypes: () => [
    { value: 'PRIMARY KEY', label: 'Primary Key' },
    { value: 'UNIQUE', label: 'Unique' },
    { value: 'CHECK', label: 'Check' },
  ],
  getDataTypes: () => [],
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
import ConstraintManagerTab from './ConstraintManagerTab';

const tables = [
  { table_name: 'users' },
  { table_name: 'products' },
];

describe('ConstraintManagerTab', () => {
  const defaultProps = {
    tables,
    onAddConstraint: vi.fn(),
    onDropConstraint: vi.fn(),
  };

  it('should render without crashing', () => {
    const { container } = render(<ConstraintManagerTab {...defaultProps} />);
    expect(container).toBeDefined();
  });

  it('should show the Constraint Manager heading', () => {
    render(<ConstraintManagerTab {...defaultProps} />);
    expect(
      screen.getAllByText(/Constraint Manager/).length,
    ).toBeGreaterThan(0);
  });

  it('should show description text', () => {
    render(<ConstraintManagerTab {...defaultProps} />);
    expect(
      screen.getAllByText(/Manage table constraints/).length,
    ).toBeGreaterThan(0);
  });

  it('should show a select dropdown for table selection', () => {
    const { container } = render(<ConstraintManagerTab {...defaultProps} />);
    const select = container.querySelector('[role="combobox"]');
    expect(select).not.toBeNull();
  });
});
