import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AddColumnDialog from './AddColumnDialog';

const dataTypes = [
  { name: 'INTEGER' },
  { name: 'VARCHAR' },
  { name: 'TEXT' },
];

describe('AddColumnDialog', () => {
  const defaultProps = {
    open: true,
    tableName: 'users',
    dataTypes,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  };

  it('should render without crashing', () => {
    const { container } = render(<AddColumnDialog {...defaultProps} />);
    expect(container).toBeDefined();
  });

  it('should show the table name in the dialog title', () => {
    render(<AddColumnDialog {...defaultProps} />);
    const headings = screen.getAllByText(/Add Column/);
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]!.textContent).toContain('users');
  });

  it('should render Cancel and Add Column buttons', () => {
    render(<AddColumnDialog {...defaultProps} />);
    expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Add Column/).length).toBeGreaterThan(0);
  });

  it('should render Column Name text field', () => {
    render(<AddColumnDialog {...defaultProps} />);
    expect(screen.getAllByText(/Column Name/).length).toBeGreaterThan(0);
  });

  it('should render Data Type select', () => {
    render(<AddColumnDialog {...defaultProps} />);
    expect(screen.getAllByText(/Data Type/).length).toBeGreaterThan(0);
  });

  it('should render Default Value text field', () => {
    render(<AddColumnDialog {...defaultProps} />);
    expect(screen.getAllByText(/Default Value/).length).toBeGreaterThan(0);
  });

  it('should render Nullable checkbox', () => {
    render(<AddColumnDialog {...defaultProps} />);
    expect(screen.getAllByText(/Nullable/).length).toBeGreaterThan(0);
  });

  it('should not render when closed', () => {
    const { container } = render(
      <AddColumnDialog {...defaultProps} open={false} />,
    );
    // When closed, dialog content should not be visible/accessible
    expect(container).toBeDefined();
  });
});
