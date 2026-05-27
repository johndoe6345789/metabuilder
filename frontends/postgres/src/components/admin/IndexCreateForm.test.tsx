import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IndexCreateForm from './IndexCreateForm';

const indexTypes = [
  { value: 'BTREE', label: 'B-Tree', description: 'Default index type' },
  { value: 'HASH', label: 'Hash', description: 'Hash-based index' },
  { value: 'GIN', label: 'GIN', description: 'Generalized inverted index' },
];

const defaultProps = {
  indexName: '',
  onIndexNameChange: vi.fn(),
  selectedColumns: [],
  onColumnsChange: vi.fn(),
  indexType: 'BTREE',
  onIndexTypeChange: vi.fn(),
  isUnique: false,
  onUniqueChange: vi.fn(),
  availableColumns: ['id', 'email', 'name'],
  indexTypes,
  loading: false,
  onCreate: vi.fn(),
  onCancel: vi.fn(),
};

describe('IndexCreateForm', () => {
  it('should render without crashing', () => {
    const { container } = render(<IndexCreateForm {...defaultProps} />);
    expect(container).toBeDefined();
  });

  it('should render the Index Name text field', () => {
    render(<IndexCreateForm {...defaultProps} />);
    expect(screen.getAllByText(/Index Name/).length).toBeGreaterThan(0);
  });

  it('should render the Columns selector', () => {
    render(<IndexCreateForm {...defaultProps} />);
    expect(screen.getAllByText(/^Columns$/).length).toBeGreaterThan(0);
  });

  it('should render the Index Type selector', () => {
    render(<IndexCreateForm {...defaultProps} />);
    expect(screen.getAllByText(/Index Type/).length).toBeGreaterThan(0);
  });

  it('should render the Unique Index checkbox', () => {
    render(<IndexCreateForm {...defaultProps} />);
    expect(screen.getAllByText(/Unique Index/).length).toBeGreaterThan(0);
  });

  it('should render Create and Cancel buttons', () => {
    render(<IndexCreateForm {...defaultProps} />);
    expect(screen.getAllByText('Create').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Cancel').length).toBeGreaterThan(0);
  });

  it('should disable Create button when loading=true', () => {
    const { container } = render(
      <IndexCreateForm {...defaultProps} loading={true} />,
    );
    const btn = container.querySelector('button[disabled]');
    expect(btn).not.toBeNull();
  });

  it('should call onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const { container } = render(
      <IndexCreateForm {...defaultProps} onCancel={onCancel} />,
    );
    // Cancel is the last button (Create is first, then Cancel)
    const buttons = container.querySelectorAll('button');
    const cancelBtn = Array.from(buttons).find(
      b => b.textContent?.includes('Cancel'),
    );
    expect(cancelBtn).not.toBeNull();
    await user.click(cancelBtn!);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('should call onCreate when Create is clicked', async () => {
    const user = userEvent.setup();
    const onCreate = vi.fn();
    const { container } = render(
      <IndexCreateForm {...defaultProps} onCreate={onCreate} />,
    );
    const buttons = container.querySelectorAll('button');
    const createBtn = Array.from(buttons).find(
      b => b.textContent?.includes('Create'),
    );
    expect(createBtn).not.toBeNull();
    await user.click(createBtn!);
    expect(onCreate).toHaveBeenCalledOnce();
  });

  it('should show index name when provided', () => {
    render(
      <IndexCreateForm {...defaultProps} indexName="idx_users_email" />,
    );
    const input = document.querySelector('input[value="idx_users_email"]');
    expect(input).not.toBeNull();
  });
});
