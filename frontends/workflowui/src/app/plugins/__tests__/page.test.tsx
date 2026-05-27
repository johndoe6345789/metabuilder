/**
 * Tests for Plugins Page
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PluginsPage from '../page'

describe('PluginsPage', () => {
  it('should render the plugins page container', () => {
    render(<PluginsPage />)
    expect(screen.getByTestId('plugins-page')).toBeInTheDocument()
  })

  it('should render the page title', () => {
    render(<PluginsPage />)
    expect(screen.getByTestId('plugins-title')).toBeInTheDocument()
    expect(screen.getByText('Plugin Marketplace')).toBeInTheDocument()
  })

  it('should render the page subtitle', () => {
    render(<PluginsPage />)
    expect(screen.getByText('Extend your workflows with powerful plugins')).toBeInTheDocument()
  })

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<PluginsPage />)
      expect(screen.getByTestId('plugins-search')).toBeInTheDocument()
    })

    it('should show all plugins initially', () => {
      render(<PluginsPage />)
      expect(screen.getByTestId('plugin-card-github')).toBeInTheDocument()
      expect(screen.getByTestId('plugin-card-slack')).toBeInTheDocument()
      expect(screen.getByTestId('plugin-card-openai')).toBeInTheDocument()
    })

    it('should filter plugins based on search query', () => {
      render(<PluginsPage />)
      const searchInput = screen.getByTestId('plugins-search')
      fireEvent.change(searchInput, { target: { value: 'github' } })
      expect(screen.getByTestId('plugin-card-github')).toBeInTheDocument()
    })

    it('should show empty state when no plugins match search', () => {
      render(<PluginsPage />)
      const searchInput = screen.getByTestId('plugins-search')
      fireEvent.change(searchInput, { target: { value: 'nonexistentplugin123' } })
      expect(screen.getByText('No plugins found')).toBeInTheDocument()
    })
  })

  describe('Plugin Tabs', () => {
    it('should render plugin tab buttons', () => {
      render(<PluginsPage />)
      // tabsWithCounts renders as plugin-tab-{id} buttons
      expect(screen.getByTestId('plugin-tab-all')).toBeInTheDocument()
    })

    it('should render installed tab', () => {
      render(<PluginsPage />)
      expect(screen.getByTestId('plugin-tab-installed')).toBeInTheDocument()
    })

    it('should filter to installed plugins when installed tab clicked', () => {
      render(<PluginsPage />)
      fireEvent.click(screen.getByTestId('plugin-tab-installed'))
      // github and slack are installed
      expect(screen.getByTestId('plugin-card-github')).toBeInTheDocument()
      expect(screen.getByTestId('plugin-card-slack')).toBeInTheDocument()
    })
  })

  describe('Plugin Cards', () => {
    it('should render GitHub plugin card', () => {
      render(<PluginsPage />)
      expect(screen.getByTestId('plugin-card-github')).toBeInTheDocument()
    })

    it('should render OpenAI plugin card', () => {
      render(<PluginsPage />)
      expect(screen.getByTestId('plugin-card-openai')).toBeInTheDocument()
    })

    it('should render plugin name in card', () => {
      render(<PluginsPage />)
      const githubMatches = screen.getAllByText('GitHub')
      expect(githubMatches.length).toBeGreaterThan(0)
    })

    it('should show installed badge for installed plugins', () => {
      render(<PluginsPage />)
      // GitHub and Slack are installed
      const installedBadges = screen.getAllByText(/✓ Installed/)
      expect(installedBadges.length).toBeGreaterThan(0)
    })

    it('should show Install button for non-installed plugins', () => {
      render(<PluginsPage />)
      const installButtons = screen.getAllByText('Install')
      expect(installButtons.length).toBeGreaterThan(0)
    })

    it('should show Configure button for installed plugins', () => {
      render(<PluginsPage />)
      const configureButtons = screen.getAllByText('Configure')
      expect(configureButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Plugin Details Dialog', () => {
    it('should open plugin details dialog on card click', () => {
      render(<PluginsPage />)
      fireEvent.click(screen.getByTestId('plugin-card-github'))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('should show plugin name in dialog', () => {
      render(<PluginsPage />)
      fireEvent.click(screen.getByTestId('plugin-card-github'))
      const githubMatches = screen.getAllByText('GitHub')
      expect(githubMatches.length).toBeGreaterThan(0)
    })

    it('should close dialog when Close button is clicked', () => {
      render(<PluginsPage />)
      fireEvent.click(screen.getByTestId('plugin-card-github'))
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      fireEvent.click(screen.getByText('Close'))
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should show Uninstall button for installed plugins in dialog', () => {
      render(<PluginsPage />)
      fireEvent.click(screen.getByTestId('plugin-card-github'))
      expect(screen.getByTestId('plugin-action-button')).toHaveTextContent('Uninstall')
    })

    it('should show Install button for non-installed plugins in dialog', () => {
      render(<PluginsPage />)
      fireEvent.click(screen.getByTestId('plugin-card-openai'))
      expect(screen.getByTestId('plugin-action-button')).toHaveTextContent('Install')
    })

    it('should handle plugin install toggle from dialog', () => {
      render(<PluginsPage />)
      fireEvent.click(screen.getByTestId('plugin-card-openai'))
      const actionBtn = screen.getByTestId('plugin-action-button')
      fireEvent.click(actionBtn)
      // After install toggle, dialog should close
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  describe('Results Count', () => {
    it('should show results count', () => {
      render(<PluginsPage />)
      expect(screen.getByText(/Showing \d+ of \d+ plugins/)).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show reset filters button in empty state', () => {
      render(<PluginsPage />)
      const searchInput = screen.getByTestId('plugins-search')
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } })
      expect(screen.getByText('Reset Filters')).toBeInTheDocument()
    })

    it('should reset filters when Reset Filters is clicked', () => {
      render(<PluginsPage />)
      const searchInput = screen.getByTestId('plugins-search')
      fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } })
      fireEvent.click(screen.getByText('Reset Filters'))
      expect(screen.getByTestId('plugin-card-github')).toBeInTheDocument()
    })
  })
})
