/**
 * Tests for EditorEmptyState component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import EditorEmptyState from '../EditorEmptyState';

describe('EditorEmptyState', () => {
  it('renders the drop nodes heading', () => {
    render(<EditorEmptyState />);
    expect(screen.getByText(/drop nodes here/i)).toBeInTheDocument();
  });

  it('renders drag instruction text', () => {
    render(<EditorEmptyState />);
    expect(screen.getByText(/drag nodes from the palette/i)).toBeInTheDocument();
  });
});
