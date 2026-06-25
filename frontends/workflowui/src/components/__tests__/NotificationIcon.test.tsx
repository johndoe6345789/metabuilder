/**
 * Tests for NotificationIcon component
 */

import React from 'react';
import { render } from '@testing-library/react';
import NotificationIcon from '../UI/NotificationIcon';

describe('NotificationIcon', () => {
  it('renders an SVG for success type', () => {
    const { container } = render(<NotificationIcon type="success" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Success uses a polyline (checkmark)
    expect(container.querySelector('polyline')).toBeInTheDocument();
  });

  it('renders an SVG for error type', () => {
    const { container } = render(<NotificationIcon type="error" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    // Error uses a circle + lines (X mark)
    expect(container.querySelector('circle')).toBeInTheDocument();
  });

  it('renders an SVG for warning type', () => {
    const { container } = render(<NotificationIcon type="warning" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.querySelector('path')).toBeInTheDocument();
  });

  it('renders an info SVG (fallback) for info type', () => {
    const { container } = render(<NotificationIcon type="info" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    // Info uses a circle
    expect(container.querySelector('circle')).toBeInTheDocument();
  });

  it('renders differently for each type', () => {
    const { container: s } = render(<NotificationIcon type="success" />);
    const { container: e } = render(<NotificationIcon type="error" />);
    const { container: w } = render(<NotificationIcon type="warning" />);
    const { container: i } = render(<NotificationIcon type="info" />);
    const htmls = [s.innerHTML, e.innerHTML, w.innerHTML, i.innerHTML];
    // Each should be unique
    const unique = new Set(htmls);
    expect(unique.size).toBe(4);
  });
});
