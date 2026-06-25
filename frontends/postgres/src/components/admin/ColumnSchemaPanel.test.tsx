import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ColumnSchemaPanel from './ColumnSchemaPanel';
import type { ColumnInfo } from './ColumnSchemaPanel';

const columns: ColumnInfo[] = [
  {
    column_name: 'user_id',
    data_type: 'integer',
    is_nullable: 'NO',
    column_default: null,
  },
  {
    column_name: 'user_email',
    data_type: 'varchar',
    is_nullable: 'YES',
    column_default: 'now()',
  },
];

describe('ColumnSchemaPanel', () => {
  const defaultProps = {
    columns,
    canAdd: true,
    canModify: true,
    canDelete: true,
    onAdd: vi.fn(),
    onModify: vi.fn(),
    onDrop: vi.fn(),
  };

  it('should render without crashing', () => {
    const { container } = render(<ColumnSchemaPanel {...defaultProps} />);
    expect(container).toBeDefined();
  });

  it('should render column names', () => {
    render(<ColumnSchemaPanel {...defaultProps} />);
    expect(screen.getAllByText('user_id').length).toBeGreaterThan(0);
    expect(screen.getAllByText('user_email').length).toBeGreaterThan(0);
  });

  it('should render data types', () => {
    render(<ColumnSchemaPanel {...defaultProps} />);
    expect(screen.getAllByText('integer').length).toBeGreaterThan(0);
    expect(screen.getAllByText('varchar').length).toBeGreaterThan(0);
  });

  it('should render column defaults', () => {
    render(<ColumnSchemaPanel {...defaultProps} />);
    expect(screen.getAllByText('now()').length).toBeGreaterThan(0);
  });

  it('should render "—" for null defaults', () => {
    render(<ColumnSchemaPanel {...defaultProps} />);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });

  it('should show the column count text', () => {
    render(<ColumnSchemaPanel {...defaultProps} />);
    expect(screen.getAllByText(/2 columns/).length).toBeGreaterThan(0);
  });

  it('should render 0 columns message for empty list', () => {
    render(<ColumnSchemaPanel {...defaultProps} columns={[]} />);
    expect(screen.getAllByText(/0 columns/).length).toBeGreaterThan(0);
  });

  it('renders more buttons with canAdd/canModify/canDelete than without', () => {
    const { container: withAll } = render(
      <ColumnSchemaPanel {...defaultProps} />,
    );
    const withCount = withAll.querySelectorAll('button').length;

    const { container: withNone } = render(
      <ColumnSchemaPanel
        {...defaultProps}
        canAdd={false}
        canModify={false}
        canDelete={false}
      />,
    );
    const noneCount = withNone.querySelectorAll('button').length;

    expect(withCount).toBeGreaterThan(noneCount);
  });

  it('should render table headers', () => {
    render(<ColumnSchemaPanel {...defaultProps} />);
    const headers = ['Column', 'Type', 'Nullable', 'Default'];
    headers.forEach(header => {
      expect(screen.getAllByText(header).length).toBeGreaterThan(0);
    });
  });

  it('should render singular "column" label for one column', () => {
    render(
      <ColumnSchemaPanel {...defaultProps} columns={[columns[0]!]} />,
    );
    // "1 column" (singular) not "1 columns"
    expect(screen.getAllByText(/1 column/).length).toBeGreaterThan(0);
    // Should NOT contain "1 columns"
    expect(screen.queryAllByText('1 columns').length).toBe(0);
  });
});
