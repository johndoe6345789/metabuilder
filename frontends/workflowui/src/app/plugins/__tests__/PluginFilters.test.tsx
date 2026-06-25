/**
 * Tests for PluginFilters component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PluginFilters from '../PluginFilters';

const defaultTabs = [
  { id: 'all', label: 'All', count: 20 },
  { id: 'installed', label: 'Installed', count: 5 },
  { id: 'available', label: 'Available', count: 15 },
];

const defaultProps = {
  searchQuery: '',
  setSearchQuery: jest.fn(),
  selectedTab: 'all',
  setSelectedTab: jest.fn(),
  selectedCategory: null,
  setSelectedCategory: jest.fn(),
  tabsWithCounts: defaultTabs,
  filteredCount: 20,
  totalPlugins: 20,
  onResetFilters: jest.fn(),
};

describe('PluginFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search input', () => {
    render(<PluginFilters {...defaultProps} />);
    expect(screen.getByTestId('plugins-search')).toBeInTheDocument();
  });

  it('calls setSearchQuery on input change', async () => {
    render(<PluginFilters {...defaultProps} />);
    await userEvent.type(screen.getByTestId('plugins-search'), 'http');
    expect(defaultProps.setSearchQuery).toHaveBeenCalled();
  });

  it('renders tab buttons with counts', () => {
    render(<PluginFilters {...defaultProps} />);
    expect(screen.getByText('All (20)')).toBeInTheDocument();
    expect(screen.getByText('Installed (5)')).toBeInTheDocument();
    expect(screen.getByText('Available (15)')).toBeInTheDocument();
  });

  it('calls setSelectedTab when a tab is clicked', async () => {
    render(<PluginFilters {...defaultProps} />);
    await userEvent.click(screen.getByTestId('plugin-tab-installed'));
    expect(defaultProps.setSelectedTab).toHaveBeenCalledWith('installed');
  });

  it('renders results count text', () => {
    render(<PluginFilters {...defaultProps} />);
    expect(screen.getByText('Showing 20 of 20 plugins')).toBeInTheDocument();
  });

  it('reflects current searchQuery value', () => {
    render(<PluginFilters {...defaultProps} searchQuery="hello" />);
    const input = screen.getByTestId('plugins-search') as HTMLInputElement;
    expect(input.value).toBe('hello');
  });
});
