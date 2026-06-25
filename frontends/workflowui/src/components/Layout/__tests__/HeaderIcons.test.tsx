/**
 * Tests for HeaderIcons - MenuIcon, LightModeIcon, DarkModeIcon, NotificationIcon, WorkflowLogo
 */

import React from 'react';
import { render } from '@testing-library/react';
import {
  MenuIcon,
  LightModeIcon,
  DarkModeIcon,
  NotificationIcon,
  WorkflowLogo,
} from '../HeaderIcons';

describe('MenuIcon', () => {
  it('renders an svg', () => {
    const { container } = render(<MenuIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('has 3 line elements for hamburger menu', () => {
    const { container } = render(<MenuIcon />);
    expect(container.querySelectorAll('line')).toHaveLength(3);
  });
});

describe('LightModeIcon', () => {
  it('renders an svg', () => {
    const { container } = render(<LightModeIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('has a circle for the sun', () => {
    const { container } = render(<LightModeIcon />);
    expect(container.querySelector('circle')).toBeInTheDocument();
  });
});

describe('DarkModeIcon', () => {
  it('renders an svg', () => {
    const { container } = render(<DarkModeIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

describe('NotificationIcon', () => {
  it('renders an svg', () => {
    const { container } = render(<NotificationIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

describe('WorkflowLogo', () => {
  it('renders an svg', () => {
    const { container } = render(<WorkflowLogo />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('has correct dimensions', () => {
    const { container } = render(<WorkflowLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });
});
