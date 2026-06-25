import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IndexTableSelector from './IndexTableSelector';

const tables = [
  { table_name: 'users' },
  { table_name: 'products' },
];

describe('IndexTableSelector', () => {
  const defaultProps = {
    tables,
    selectedTable: '',
    loading: false,
    onTableChange: vi.fn(),
    onCreateClick: vi.fn(),
  };

  it('should render without crashing', () => {
    const { container } = render(<IndexTableSelector {...defaultProps} />);
    expect(container).toBeDefined();
  });

  it('should render the Select Table label', () => {
    render(<IndexTableSelector {...defaultProps} />);
    // MUI renders the label multiple times
    const labels = screen.getAllByText(/Select Table/);
    expect(labels.length).toBeGreaterThan(0);
  });

  it('should not show Create Index button when no table is selected', () => {
    render(<IndexTableSelector {...defaultProps} selectedTable="" />);
    expect(screen.queryByText('Create Index')).toBeNull();
  });

  it('should show Create Index button when a table is selected', () => {
    render(
      <IndexTableSelector {...defaultProps} selectedTable="users" />,
    );
    expect(screen.getAllByText(/Create Index/).length).toBeGreaterThan(0);
  });

  it('should render a combobox for table selection', () => {
    const { container } = render(<IndexTableSelector {...defaultProps} />);
    const combo = container.querySelector('[role="combobox"]');
    expect(combo).not.toBeNull();
  });

  it('should call onCreateClick when Create Index is clicked', async () => {
    const user = userEvent.setup();
    const onCreateClick = vi.fn();

    const { container } = render(
      <IndexTableSelector
        {...defaultProps}
        selectedTable="users"
        onCreateClick={onCreateClick}
      />,
    );

    // Find the button element directly in this container
    const btn = container.querySelector('button:not([disabled])');
    expect(btn).not.toBeNull();
    await user.click(btn!);
    expect(onCreateClick).toHaveBeenCalledOnce();
  });

  it('Create Index button should be disabled when loading', () => {
    render(
      <IndexTableSelector
        {...defaultProps}
        selectedTable="users"
        loading={true}
      />,
    );
    // Find the button element
    const { container } = render(
      <IndexTableSelector
        {...defaultProps}
        selectedTable="users"
        loading={true}
      />,
    );
    const btn = container.querySelector('button[disabled]');
    expect(btn).not.toBeNull();
  });
});
