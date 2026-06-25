import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ColumnTableList from './ColumnTableList';

const tables = [
  { table_name: 'users' },
  { table_name: 'products' },
  { table_name: 'orders' },
];

describe('ColumnTableList', () => {
  it('should render all table names', () => {
    render(
      <ColumnTableList
        tables={tables}
        selectedTable=""
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByText('users')).toBeDefined();
    expect(screen.getByText('products')).toBeDefined();
    expect(screen.getByText('orders')).toBeDefined();
  });

  it('should render empty list without errors', () => {
    const { container } = render(
      <ColumnTableList tables={[]} selectedTable="" onSelect={vi.fn()} />,
    );
    expect(container).toBeDefined();
  });

  it('should render a button for each table row', () => {
    render(
      <ColumnTableList
        tables={tables}
        selectedTable=""
        onSelect={vi.fn()}
      />,
    );

    // Each table row has at least one button (ListItemButton)
    const buttons = screen.getAllByRole('button');
    // At least as many buttons as tables
    expect(buttons.length).toBeGreaterThanOrEqual(tables.length);
  });

  it('should mark the selected table as selected', () => {
    render(
      <ColumnTableList
        tables={tables}
        selectedTable="users"
        onSelect={vi.fn()}
      />,
    );

    // MUI adds 'Mui-selected' class to the selected ListItemButton
    const allItems = screen.getAllByRole('button');
    const selectedItem = allItems.find(el =>
      el.classList.contains('Mui-selected'),
    );
    expect(selectedItem).toBeDefined();
  });
});
