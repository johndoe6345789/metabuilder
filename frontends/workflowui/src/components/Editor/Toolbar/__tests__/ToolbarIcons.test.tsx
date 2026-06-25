/**
 * Tests for ToolbarIcons - SaveIcon, ExecuteIcon, ValidateIcon SVG components
 */

import React from 'react';
import { render } from '@testing-library/react';
import { SaveIcon, ExecuteIcon, ValidateIcon } from '../ToolbarIcons';

describe('SaveIcon', () => {
  it('renders an svg element', () => {
    const { container } = render(<SaveIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('has correct dimensions', () => {
    const { container } = render(<SaveIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });
});

describe('ExecuteIcon', () => {
  it('renders an svg element', () => {
    const { container } = render(<ExecuteIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('has correct dimensions', () => {
    const { container } = render(<ExecuteIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });
});

describe('ValidateIcon', () => {
  it('renders an svg element', () => {
    const { container } = render(<ValidateIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('has correct dimensions', () => {
    const { container } = render(<ValidateIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });
});
