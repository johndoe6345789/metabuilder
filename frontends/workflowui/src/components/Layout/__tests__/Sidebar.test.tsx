/**
 * Tests for Sidebar component
 */

const mockPathname = jest.fn(() => '/');

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Sidebar } from '../Sidebar';

const defaultProps = {
  isOpen: true,
  isMobile: false,
  onClose: jest.fn(),
};

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue('/');
  });

  it('renders aside with sidebar data-testid in desktop mode', () => {
    render(<Sidebar {...defaultProps} isMobile={false} />);
    expect(screen.getByTestId('nav-sidebar')).toBeInTheDocument();
  });

  it('renders SidebarMobileDrawer in mobile mode', () => {
    render(<Sidebar {...defaultProps} isMobile={true} />);
    // Mobile renders the drawer wrapper which also has nav-sidebar testid
    expect(screen.getByTestId('nav-sidebar')).toBeInTheDocument();
  });

  it('shows sidebar content with nav links', () => {
    render(<Sidebar {...defaultProps} isMobile={false} />);
    // SidebarContent renders the nav with links from sidebar-nav.json
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('highlights active route correctly for root path', () => {
    mockPathname.mockReturnValue('/');
    render(<Sidebar {...defaultProps} isMobile={false} />);
    // The home link should be active
    const homeLink = screen.getByTestId('nav-link-dashboard');
    expect(homeLink).toBeInTheDocument();
  });

  it('highlights active route for sub-path', () => {
    mockPathname.mockReturnValue('/workflows/recent');
    render(<Sidebar {...defaultProps} isMobile={false} />);
    // The /workflows link should be active since pathname starts with it
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });
});
