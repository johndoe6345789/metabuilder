/**
 * Tests for SidebarNavItem component
 */

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import SidebarNavItem from '../SidebarNavItem';

const defaultProps = {
  href: '/workflows',
  label: 'Workflows',
  itemTestId: 'workflows',
  icon: <span data-testid="wf-icon" />,
  isActive: false,
};

describe('SidebarNavItem', () => {
  it('renders the label', () => {
    render(<SidebarNavItem {...defaultProps} />);
    expect(screen.getByText('Workflows')).toBeInTheDocument();
  });

  it('renders the icon', () => {
    render(<SidebarNavItem {...defaultProps} />);
    expect(screen.getByTestId('wf-icon')).toBeInTheDocument();
  });

  it('renders a link with correct href', () => {
    render(<SidebarNavItem {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/workflows');
  });

  it('renders with data-testid on link', () => {
    render(<SidebarNavItem {...defaultProps} />);
    expect(screen.getByTestId('nav-link-workflows')).toBeInTheDocument();
  });

  it('does not render badge when badge is 0', () => {
    const { container } = render(<SidebarNavItem {...defaultProps} badge={0} />);
    expect(container.querySelector('.navBadge')).toBeNull();
  });

  it('renders badge count when badge > 0', () => {
    render(<SidebarNavItem {...defaultProps} badge={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('does not render badge when badge prop is omitted', () => {
    const { container } = render(<SidebarNavItem {...defaultProps} />);
    // badge text won't be in document
    expect(container.querySelectorAll('span').length).toBeGreaterThanOrEqual(1);
    // Just check no numeric badge appears
    expect(screen.queryByText(/^\d+$/)).toBeNull();
  });
});
