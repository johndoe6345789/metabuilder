/**
 * Tests for AdapterSelector component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AdapterSelector from '../AdapterSelector';

describe('AdapterSelector', () => {
  it('renders a select element', () => {
    render(
      <AdapterSelector selectedAdapter="sqlite" onAdapterChange={jest.fn()} />
    );
    expect(screen.getByTestId('adapter-select')).toBeInTheDocument();
  });

  it('shows current selected adapter', () => {
    render(
      <AdapterSelector selectedAdapter="postgres" onAdapterChange={jest.fn()} />
    );
    const select = screen.getByTestId('adapter-select') as HTMLSelectElement;
    expect(select.value).toBe('postgres');
  });

  it('calls onAdapterChange when selection changes', () => {
    const onAdapterChange = jest.fn();
    render(
      <AdapterSelector selectedAdapter="sqlite" onAdapterChange={onAdapterChange} />
    );
    fireEvent.change(screen.getByTestId('adapter-select'), {
      target: { value: 'mysql' },
    });
    expect(onAdapterChange).toHaveBeenCalledWith('mysql');
  });

  it('renders adapter options from config', () => {
    render(
      <AdapterSelector selectedAdapter="sqlite" onAdapterChange={jest.fn()} />
    );
    // At least sqlite and memory options should be present from DB_CONFIG
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(0);
  });

  it('renders Adapter label', () => {
    render(
      <AdapterSelector selectedAdapter="sqlite" onAdapterChange={jest.fn()} />
    );
    expect(screen.getByText('Adapter')).toBeInTheDocument();
  });
});
