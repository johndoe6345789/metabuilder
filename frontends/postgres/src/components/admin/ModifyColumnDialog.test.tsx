import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ModifyColumnDialog from './ModifyColumnDialog';

const columns = [
  { column_name: 'id' },
  { column_name: 'email' },
];

const dataTypes = [
  { name: 'INTEGER' },
  { name: 'VARCHAR' },
  { name: 'TEXT' },
];

describe('ModifyColumnDialog', () => {
  const defaultProps = {
    open: true,
    tableName: 'users',
    columns,
    dataTypes,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  };

  it('should render without crashing', () => {
    const { container } = render(<ModifyColumnDialog {...defaultProps} />);
    expect(container).toBeDefined();
  });

  it('should show the table name in the dialog title', () => {
    render(<ModifyColumnDialog {...defaultProps} />);
    const headings = screen.getAllByText(/Modify Column/);
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]!.textContent).toContain('users');
  });

  it('should render Cancel and Save Changes buttons', () => {
    render(<ModifyColumnDialog {...defaultProps} />);
    expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Save Changes/).length).toBeGreaterThan(0);
  });

  it('should render the Column selector', () => {
    render(<ModifyColumnDialog {...defaultProps} />);
    // "Column" label appears in the select label
    const labels = screen.getAllByText(/^Column$/);
    expect(labels.length).toBeGreaterThan(0);
  });
});
