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
  it('renders without crashing', () => {
    const { container } = render(
      <IndexList indexes={indexes} onDeleteIndex={vi.fn()} />,
    );
    expect(container.querySelector('table')).toBeDefined();
  });

  it('renders all index names', () => {
    render(<IndexList indexes={indexes} onDeleteIndex={vi.fn()} />);
    expect(screen.getAllByText('pk_users').length).toBeGreaterThan(0);
    expect(screen.getAllByText('idx_email').length).toBeGreaterThan(0);
    expect(screen.getAllByText('idx_name_created').length).toBeGreaterThan(0);
  });

  it('shows PRIMARY KEY chip for primary indexes', () => {
    render(<IndexList indexes={indexes} onDeleteIndex={vi.fn()} />);
    expect(screen.getAllByText('PRIMARY KEY').length).toBeGreaterThan(0);
  });

  it('shows UNIQUE chip for unique non-primary indexes', () => {
    render(<IndexList indexes={indexes} onDeleteIndex={vi.fn()} />);
    expect(screen.getAllByText('UNIQUE').length).toBeGreaterThan(0);
  });

  it('renders BTREE index type', () => {
    render(<IndexList indexes={indexes} onDeleteIndex={vi.fn()} />);
    expect(screen.getAllByText('BTREE').length).toBeGreaterThan(0);
  });

  it('renders columns as comma-separated list', () => {
    render(<IndexList indexes={indexes} onDeleteIndex={vi.fn()} />);
    expect(screen.getAllByText('id').length).toBeGreaterThan(0);
    expect(screen.getAllByText('name, created_at').length).toBeGreaterThan(0);
  });

  it('primary index has no drop button', () => {
    const { container } = render(
      <IndexList indexes={[indexes[0]!]} onDeleteIndex={vi.fn()} />,
    );
    expect(
      container.querySelector('button[aria-label="Drop index"]'),
    ).toBeNull();
  });

  it('non-primary index has a drop button', () => {
    const { container } = render(
      <IndexList indexes={[indexes[1]!]} onDeleteIndex={vi.fn()} />,
    );
    expect(
      container.querySelector('button[aria-label="Drop index"]'),
    ).not.toBeNull();
  });

  it('calls onDeleteIndex when drop button is clicked', async () => {
    const user = userEvent.setup();
    const onDeleteIndex = vi.fn();
    const { container } = render(
      <IndexList indexes={[indexes[1]!]} onDeleteIndex={onDeleteIndex} />,
    );
    const btn = container.querySelector('button[aria-label="Drop index"]');
    expect(btn).not.toBeNull();
    await user.click(btn!);
    expect(onDeleteIndex).toHaveBeenCalledWith('idx_email');
  });

  it('renders empty state without errors', () => {
    const { container } = render(
      <IndexList indexes={[]} onDeleteIndex={vi.fn()} />,
    );
    expect(container.querySelector('table')).toBeDefined();
  });
});
