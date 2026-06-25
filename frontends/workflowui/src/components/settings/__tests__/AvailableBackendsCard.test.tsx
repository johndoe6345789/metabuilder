/**
 * Tests for AvailableBackendsCard component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import AvailableBackendsCard from '../AvailableBackendsCard';

describe('AvailableBackendsCard', () => {
  it('renders nothing when adapters array is empty', () => {
    const { container } = render(<AvailableBackendsCard adapters={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the card when adapters are provided', () => {
    const adapters = [{ name: 'sqlite', active: true }];
    render(<AvailableBackendsCard adapters={adapters} />);
    expect(screen.getByTestId('backends-card')).toBeInTheDocument();
  });

  it('renders "Available Backends" title', () => {
    render(<AvailableBackendsCard adapters={[{ name: 'sqlite', active: true }]} />);
    expect(screen.getByText('Available Backends')).toBeInTheDocument();
  });

  it('renders a chip for each adapter', () => {
    const adapters = [
      { name: 'sqlite', active: true },
      { name: 'postgres', active: false },
      { name: 'mysql', active: false },
    ];
    render(<AvailableBackendsCard adapters={adapters} />);
    expect(screen.getByText('sqlite')).toBeInTheDocument();
    expect(screen.getByText('postgres')).toBeInTheDocument();
    expect(screen.getByText('mysql')).toBeInTheDocument();
  });
});
