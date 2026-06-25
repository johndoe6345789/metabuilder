/**
 * Tests for SidebarContent component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import SidebarContent from '../SidebarContent';

// Mock next/link for SidebarNavItem
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  );
});

const iconMap = {
  HomeIcon: <span data-testid="home-icon" />,
  WorkflowIcon: <span data-testid="workflow-icon" />,
  RecentIcon: <span data-testid="recent-icon" />,
  StarIcon: <span data-testid="star-icon" />,
  TemplatesIcon: <span data-testid="templates-icon" />,
  PluginsIcon: <span data-testid="plugins-icon" />,
  SettingsIcon: <span data-testid="settings-icon" />,
  NotificationsIcon: <span data-testid="notifications-icon" />,
  HelpIcon: <span data-testid="help-icon" />,
  DocsIcon: <span data-testid="docs-icon" />,
};

describe('SidebarContent', () => {
  it('renders navigation element', () => {
    render(<SidebarContent iconMap={iconMap} isActive={() => false} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders New Workflow button', () => {
    render(<SidebarContent iconMap={iconMap} isActive={() => false} />);
    expect(screen.getByTestId('button-new-workflow')).toBeInTheDocument();
    expect(screen.getByText('+ New Workflow')).toBeInTheDocument();
  });

  it('renders nav section titles', () => {
    render(<SidebarContent iconMap={iconMap} isActive={() => false} />);
    // These come from the sidebar-nav.json - at least one section heading
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });

  it('renders nav links', () => {
    render(<SidebarContent iconMap={iconMap} isActive={() => false} />);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
