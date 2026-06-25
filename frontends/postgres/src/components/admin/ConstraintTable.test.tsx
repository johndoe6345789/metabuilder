import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConstraintTable from './ConstraintTable';

const constraints = [
  {
    constraint_name: 'pk_id',
    constraint_type: 'PRIMARY KEY',
    column_name: 'id',
    check_clause: undefined,
  },
  {
    constraint_name: 'uq_email',
    constraint_type: 'UNIQUE',
    column_name: 'email',
    check_clause: undefined,
  },
  {
    constraint_name: 'chk_price',
    constraint_type: 'CHECK',
    column_name: undefined,
    check_clause: 'price_positive',
  },
];

describe('ConstraintTable', () => {
  it('should render without crashing', () => {
    const { container } = render(
      <ConstraintTable constraints={constraints} onDeleteClick={vi.fn()} />,
    );
    expect(container).toBeDefined();
  });

  it('should render constraint names', () => {
    render(
      <ConstraintTable constraints={constraints} onDeleteClick={vi.fn()} />,
    );
    expect(screen.getAllByText('pk_id').length).toBeGreaterThan(0);
    expect(screen.getAllByText('uq_email').length).toBeGreaterThan(0);
    expect(screen.getAllByText('chk_price').length).toBeGreaterThan(0);
  });

  it('should render constraint types', () => {
    render(
      <ConstraintTable constraints={constraints} onDeleteClick={vi.fn()} />,
    );
    expect(screen.getAllByText('PRIMARY KEY').length).toBeGreaterThan(0);
    expect(screen.getAllByText('UNIQUE').length).toBeGreaterThan(0);
    expect(screen.getAllByText('CHECK').length).toBeGreaterThan(0);
  });

  it('should render column names', () => {
    render(
      <ConstraintTable constraints={constraints} onDeleteClick={vi.fn()} />,
    );
    expect(screen.getAllByText('id').length).toBeGreaterThan(0);
    expect(screen.getAllByText('email').length).toBeGreaterThan(0);
  });

  it('should render check clause when present', () => {
    render(
      <ConstraintTable constraints={constraints} onDeleteClick={vi.fn()} />,
    );
    expect(screen.getAllByText('price_positive').length).toBeGreaterThan(0);
  });

  it('should show "No constraints found" when empty', () => {
    render(
      <ConstraintTable constraints={[]} onDeleteClick={vi.fn()} />,
    );
    expect(
      screen.getAllByText('No constraints found for this table').length,
    ).toBeGreaterThan(0);
  });

  it('should show more Delete buttons with canDelete=true vs false', () => {
    const { container: withDelete } = render(
      <ConstraintTable
        constraints={constraints}
        canDelete={true}
        onDeleteClick={vi.fn()}
      />,
    );
    const { container: withoutDelete } = render(
      <ConstraintTable
        constraints={constraints}
        canDelete={false}
        onDeleteClick={vi.fn()}
      />,
    );

    const withDeleteBtns = withDelete.querySelectorAll('button').length;
    const withoutDeleteBtns = withoutDelete.querySelectorAll('button').length;
    expect(withDeleteBtns).toBeGreaterThan(withoutDeleteBtns);
  });

  it('should call onDeleteClick when Delete is clicked', async () => {
    const user = userEvent.setup();
    const onDeleteClick = vi.fn();

    const { container } = render(
      <ConstraintTable
        constraints={[constraints[0]!]}
        canDelete={true}
        onDeleteClick={onDeleteClick}
      />,
    );

    // Click the first button in the table
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    await user.click(btn!);
    expect(onDeleteClick).toHaveBeenCalledOnce();
    expect(onDeleteClick).toHaveBeenCalledWith(constraints[0]);
  });

  it('should render table headers', () => {
    render(
      <ConstraintTable constraints={[]} onDeleteClick={vi.fn()} />,
    );
    expect(
      screen.getAllByText('Constraint Name').length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('Type').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Actions').length).toBeGreaterThan(0);
  });
});
