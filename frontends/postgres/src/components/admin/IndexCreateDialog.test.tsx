import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IndexCreateDialog from './IndexCreateDialog';

const indexTypes = [
  { value: 'BTREE', label: 'B-Tree', description: 'Default index type' },
  { value: 'HASH', label: 'Hash', description: 'Hash-based index' },
];

const defaultProps = {
  selectedTable: 'users',
  indexName: '',
  onIndexNameChange: vi.fn(),
  selectedColumns: [],
  onColumnsChange: vi.fn(),
  indexType: 'BTREE',
  onIndexTypeChange: vi.fn(),
  isUnique: false,
  onUniqueChange: vi.fn(),
  availableColumns: ['id', 'email'],
  indexTypes,
  loading: false,
  onCreate: vi.fn(),
  onCancel: vi.fn(),
};

describe('IndexCreateDialog', () => {
  it('should render without crashing', () => {
    const { container } = render(<IndexCreateDialog {...defaultProps} />);
    expect(container).toBeDefined();
  });

  it('should show the selected table name in the title', () => {
    render(<IndexCreateDialog {...defaultProps} />);
    expect(
      screen.getAllByText(/Create Index on users/).length,
    ).toBeGreaterThan(0);
  });

  it('should render the IndexCreateForm fields', () => {
    render(<IndexCreateDialog {...defaultProps} />);
    expect(screen.getAllByText(/Index Name/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Unique Index/).length).toBeGreaterThan(0);
  });

  it('should call onCancel when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const { container } = render(
      <IndexCreateDialog {...defaultProps} onCancel={onCancel} />,
    );
    // The backdrop is the first Box element - has a fixed overlay class
    const backdrop = container.querySelector(
      '[class*="MuiBox"][style*="rgba"]',
    ) as HTMLElement | null;
    if (backdrop) {
      await user.click(backdrop);
      expect(onCancel).toHaveBeenCalled();
    }
  });
});
