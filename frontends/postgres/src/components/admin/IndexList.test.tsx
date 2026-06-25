import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IndexList from './IndexList';

const indexes = [
  {
    index_name: 'pk_users',
    is_primary: true,
    is_unique: true,
    index_type: 'btree',
    columns: ['id'],
  },
  {
    index_name: 'idx_email',
    is_primary: false,
    is_unique: true,
    index_type: 'btree',
    columns: ['email'],
  },
  {
    index_name: 'idx_name_created',
    is_primary: false,
    is_unique: false,
    index_type: 'btree',
    columns: ['name', 'created_at'],
  },
];

describe('IndexList', () => {
  it('should render without crashing', () => {
    const { container } = render(
      <IndexList tableName="users" indexes={indexes} onDeleteIndex={vi.fn()} />,
    );
    expect(container).toBeDefined();
  });

  it('should render the table name in the heading', () => {
    render(
      <IndexList tableName="users" indexes={indexes} onDeleteIndex={vi.fn()} />,
    );
    const headings = screen.getAllByText(/Indexes on/);
    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]!.textContent).toContain('users');
  });

  it('should render all index names', () => {
    render(
      <IndexList tableName="users" indexes={indexes} onDeleteIndex={vi.fn()} />,
    );
    expect(screen.getAllByText('pk_users').length).toBeGreaterThan(0);
    expect(screen.getAllByText('idx_email').length).toBeGreaterThan(0);
    expect(screen.getAllByText('idx_name_created').length).toBeGreaterThan(0);
  });

  it('should show PRIMARY KEY chip for primary indexes', () => {
    render(
      <IndexList tableName="users" indexes={indexes} onDeleteIndex={vi.fn()} />,
    );
    expect(screen.getAllByText('PRIMARY KEY').length).toBeGreaterThan(0);
  });

  it('should show UNIQUE chip for unique non-primary indexes', () => {
    render(
      <IndexList tableName="users" indexes={indexes} onDeleteIndex={vi.fn()} />,
    );
    expect(screen.getAllByText('UNIQUE').length).toBeGreaterThan(0);
  });

  it('should render BTREE index type chips', () => {
    render(
      <IndexList tableName="users" indexes={indexes} onDeleteIndex={vi.fn()} />,
    );
    expect(screen.getAllByText('BTREE').length).toBeGreaterThan(0);
  });

  it('should render columns in secondary text', () => {
    render(
      <IndexList tableName="users" indexes={indexes} onDeleteIndex={vi.fn()} />,
    );
    expect(screen.getAllByText('Columns: id').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText('Columns: name, created_at').length,
    ).toBeGreaterThan(0);
  });

  it('should have more buttons for non-primary indexes than primary', () => {
    // Non-primary indexes show a delete icon button in addition to
    // any navigation/icon buttons already in the list.
    const { container: primaryContainer } = render(
      <IndexList
        tableName="users"
        indexes={[indexes[0]!]}
        onDeleteIndex={vi.fn()}
      />,
    );
    // Primary key: no IconButton delete button
    const primaryBtns = primaryContainer.querySelectorAll(
      'button.MuiIconButton-root',
    );

    const { container: nonPrimaryContainer } = render(
      <IndexList
        tableName="users"
        indexes={[indexes[1]!]}
        onDeleteIndex={vi.fn()}
      />,
    );
    const nonPrimaryBtns = nonPrimaryContainer.querySelectorAll(
      'button.MuiIconButton-root',
    );

    // Non-primary has 1 delete icon button, primary has 0
    expect(nonPrimaryBtns.length).toBeGreaterThan(primaryBtns.length);
  });

  it('should call onDeleteIndex via the MuiIconButton', async () => {
    const user = userEvent.setup();
    const onDeleteIndex = vi.fn();

    const { container } = render(
      <IndexList
        tableName="users"
        indexes={[indexes[1]!]}
        onDeleteIndex={onDeleteIndex}
      />,
    );

    const iconBtn = container.querySelector('button.MuiIconButton-root');
    expect(iconBtn).not.toBeNull();
    await user.click(iconBtn!);
    expect(onDeleteIndex).toHaveBeenCalledWith('idx_email');
  });

  it('should render empty state without errors', () => {
    const { container } = render(
      <IndexList tableName="users" indexes={[]} onDeleteIndex={vi.fn()} />,
    );
    expect(container.querySelector('ul')).toBeDefined();
  });
});
