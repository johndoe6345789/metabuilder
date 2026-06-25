/**
 * Tests for plugin page components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PluginEmptyState from '../PluginEmptyState';
import PluginStats from '../PluginStats';
import PluginsHeader from '../PluginsHeader';
import PluginCategoryButtons from '../PluginCategoryButtons';

// ── PluginEmptyState ─────────────────────────────────────────────────────────
describe('PluginEmptyState', () => {
  it('renders "No plugins found" message', () => {
    render(<PluginEmptyState onResetFilters={jest.fn()} />);
    expect(screen.getByText('No plugins found')).toBeInTheDocument();
  });

  it('renders Reset Filters button', () => {
    render(<PluginEmptyState onResetFilters={jest.fn()} />);
    expect(
      screen.getByRole('button', { name: /reset filters/i })
    ).toBeInTheDocument();
  });

  it('calls onResetFilters when button is clicked', async () => {
    const onReset = jest.fn();
    render(<PluginEmptyState onResetFilters={onReset} />);
    await userEvent.click(
      screen.getByRole('button', { name: /reset filters/i })
    );
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('renders search icon text', () => {
    render(<PluginEmptyState onResetFilters={jest.fn()} />);
    expect(screen.getByText('🔍')).toBeInTheDocument();
  });
});

// ── PluginStats ──────────────────────────────────────────────────────────────
describe('PluginStats', () => {
  it('renders total plugins count', () => {
    render(
      <PluginStats totalPlugins={50} installedPlugins={10} totalDownloads={5000} />
    );
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('renders installed plugins count', () => {
    render(
      <PluginStats totalPlugins={50} installedPlugins={10} totalDownloads={5000} />
    );
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders total downloads with locale formatting', () => {
    render(
      <PluginStats totalPlugins={1} installedPlugins={0} totalDownloads={12345} />
    );
    expect(screen.getByText(/12[,.]?345/)).toBeInTheDocument();
  });

  it('renders stat labels', () => {
    render(
      <PluginStats totalPlugins={1} installedPlugins={0} totalDownloads={0} />
    );
    expect(screen.getByText('Total Plugins')).toBeInTheDocument();
    expect(screen.getByText('Installed')).toBeInTheDocument();
    expect(screen.getByText('Total Downloads')).toBeInTheDocument();
  });
});

// ── PluginsHeader ────────────────────────────────────────────────────────────
describe('PluginsHeader', () => {
  it('renders the page title', () => {
    render(
      <PluginsHeader totalPlugins={10} installedPlugins={2} totalDownloads={1000} />
    );
    expect(screen.getByTestId('plugins-title')).toBeInTheDocument();
    expect(screen.getByText('Plugin Marketplace')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(
      <PluginsHeader totalPlugins={10} installedPlugins={2} totalDownloads={1000} />
    );
    expect(
      screen.getByText(/Extend your workflows/i)
    ).toBeInTheDocument();
  });
});

// ── PluginCategoryButtons ────────────────────────────────────────────────────
describe('PluginCategoryButtons', () => {
  it('renders the "All Categories" button', () => {
    render(
      <PluginCategoryButtons
        selectedCategory={null}
        onCategoryChange={jest.fn()}
      />
    );
    expect(screen.getByTestId('category-all')).toBeInTheDocument();
    expect(screen.getByText('All Categories')).toBeInTheDocument();
  });

  it('calls onCategoryChange(null) when "All Categories" is clicked', async () => {
    const onChange = jest.fn();
    render(
      <PluginCategoryButtons selectedCategory={null} onCategoryChange={onChange} />
    );
    await userEvent.click(screen.getByTestId('category-all'));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('renders category buttons from JSON config', () => {
    render(
      <PluginCategoryButtons
        selectedCategory={null}
        onCategoryChange={jest.fn()}
      />
    );
    // At least one category button should exist beyond "All Categories"
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(1);
  });

  it('calls onCategoryChange with category id when a category is clicked', async () => {
    const onChange = jest.fn();
    render(
      <PluginCategoryButtons selectedCategory={null} onCategoryChange={onChange} />
    );
    // Click the second button (first category)
    const buttons = screen.getAllByRole('button');
    await userEvent.click(buttons[1]);
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).not.toBeNull();
  });
});
