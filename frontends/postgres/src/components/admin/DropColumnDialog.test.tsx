import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DropColumnDialog from './DropColumnDialog';

const columns = [
  { column_name: 'id' },
  { column_name: 'email' },
  { column_name: 'name' },
];

describe('DropColumnDialog', () => {
  const defaultProps = {
    open: true,
    tableName: 'users',
    columns,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  };

  it('should render without crashing', () => {
    const { container } = render(<DropColumnDialog {...defaultProps} />);
    expect(container).toBeDefined();
  });

  it('should show the table name in the dialog title', () => {
    render(<DropColumnDialog {...defaultProps} />);
    const headings = screen.getAllByText(/Drop Column/);
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]!.textContent).toContain('users');
  });

  it('should show a warning about permanent deletion', () => {
    render(<DropColumnDialog {...defaultProps} />);
    expect(
      screen.getAllByText(/permanently deletes/).length,
    ).toBeGreaterThan(0);
  });

  it('should render Cancel and Drop Column buttons', () => {
    render(<DropColumnDialog {...defaultProps} />);
    expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Drop Column/).length).toBeGreaterThan(0);
  });

  it('should render the column selector', () => {
    render(<DropColumnDialog {...defaultProps} />);
    expect(screen.getAllByText(/Column to drop/).length).toBeGreaterThan(0);
  });
});
