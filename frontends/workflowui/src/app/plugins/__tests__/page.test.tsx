/**
 * Note: FakeMUI components, icons, and styles are mocked via Jest config

Tests for Plugins Page
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PluginsPage from '../page'


// Mock styles
jest.mock('@/../../../scss/atoms/plugins.module.scss', () => ({
  pluginsPage: 'plugins-page',
  pageHeader: 'page-header',
  searchSection: 'search-section',
  filtersSection: 'filters-section',
  pluginGrid: 'plugin-grid',
  pluginCard: 'plugin-card',
}))

describe('PluginsPage', () => {
  it('should render the plugins page', () => {
    render(<PluginsPage />)
    expect(screen.getByTestId('plugins-page')).toBeInTheDocument()
  })

  it('should render the page header', () => {
    render(<PluginsPage />)
    expect(screen.getByTestId('plugins-header')).toBeInTheDocument()
    expect(screen.getByText('Plugins')).toBeInTheDocument()
  })

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<PluginsPage />)
      expect(screen.getByTestId('plugins-search')).toBeInTheDocument()
    })

    it('should filter plugins based on search query', () => {
      render(<PluginsPage />)

      const searchInput = screen.getByTestId('plugins-search') as HTMLInputElement

      // Initially, multiple plugins should be visible
      expect(screen.getByTestId('plugin-github')).toBeInTheDocument()
      expect(screen.getByTestId('plugin-slack')).toBeInTheDocument()

      // Search for 'github'
      fireEvent.change(searchInput, { target: { value: 'github' } })

      // GitHub plugin should be visible
      expect(screen.getByTestId('plugin-github')).toBeInTheDocument()
    })

    it('should show message when no plugins match search', () => {
      render(<PluginsPage />)

      const searchInput = screen.getByTestId('plugins-search') as HTMLInputElement
      fireEvent.change(searchInput, { target: { value: 'nonexistentplugin123' } })

      expect(screen.getByText(/No plugins found/i)).toBeInTheDocument()
    })
  })

  describe('Category Filters', () => {
    it('should render category filter chips', () => {
      render(<PluginsPage />)

      expect(screen.getByTestId('category-all')).toBeInTheDocument()
      expect(screen.getByTestId('category-integrations')).toBeInTheDocument()
      expect(screen.getByTestId('category-ai')).toBeInTheDocument()
      expect(screen.getByTestId('category-payments')).toBeInTheDocument()
    })

    it('should filter plugins by category', () => {
      render(<PluginsPage />)

      const aiCategory = screen.getByTestId('category-ai')
      fireEvent.click(aiCategory)

      // Should show AI category plugins
      expect(screen.getByTestId('plugin-openai')).toBeInTheDocument()
    })

    it('should show all plugins when "All" category is selected', () => {
      render(<PluginsPage />)

      // First filter to specific category
      const aiCategory = screen.getByTestId('category-ai')
      fireEvent.click(aiCategory)

      // Then click All
      const allCategory = screen.getByTestId('category-all')
      fireEvent.click(allCategory)

      // All plugins should be visible again
      expect(screen.getByTestId('plugin-github')).toBeInTheDocument()
      expect(screen.getByTestId('plugin-openai')).toBeInTheDocument()
    })
  })

  describe('Status Filters', () => {
    it('should render status filter chips', () => {
      render(<PluginsPage />)

      expect(screen.getByTestId('status-all')).toBeInTheDocument()
      expect(screen.getByTestId('status-installed')).toBeInTheDocument()
      expect(screen.getByTestId('status-available')).toBeInTheDocument()
    })

    it('should filter installed plugins', () => {
      render(<PluginsPage />)

      const installedStatus = screen.getByTestId('status-installed')
      fireEvent.click(installedStatus)

      // Should show installed plugins
      expect(screen.getByTestId('plugin-github')).toBeInTheDocument()
      expect(screen.getByTestId('plugin-slack')).toBeInTheDocument()
    })

    it('should filter available plugins', () => {
      render(<PluginsPage />)

      const availableStatus = screen.getByTestId('status-available')
      fireEvent.click(availableStatus)

      // Should show non-installed plugins
      expect(screen.getByTestId('plugin-openai')).toBeInTheDocument()
      expect(screen.getByTestId('plugin-notion')).toBeInTheDocument()
    })
  })

  describe('Plugin Cards', () => {
    it('should render plugin cards with correct data', () => {
      render(<PluginsPage />)

      const githubCard = screen.getByTestId('plugin-github')
      expect(githubCard).toBeInTheDocument()
      expect(screen.getByText('GitHub')).toBeInTheDocument()
      expect(screen.getByText(/Integrate with GitHub repositories/i)).toBeInTheDocument()
    })

    it('should show "Installed" badge for installed plugins', () => {
      render(<PluginsPage />)

      expect(screen.getAllByText('Installed')).toHaveLength(2) // GitHub and Slack
    })

    it('should show "Install" button for non-installed plugins', () => {
      render(<PluginsPage />)

      const openaiCard = screen.getByTestId('plugin-openai')
      expect(openaiCard).toBeInTheDocument()

      const installBtn = screen.getByTestId('install-openai')
      expect(installBtn).toBeInTheDocument()
      expect(installBtn).toHaveTextContent('Install')
    })

    it('should open plugin details dialog on card click', () => {
      render(<PluginsPage />)

      const githubCard = screen.getByTestId('plugin-github')
      fireEvent.click(githubCard)

      expect(screen.getByTestId('plugin-details-dialog')).toBeInTheDocument()
    })
  })

  describe('Plugin Details Dialog', () => {
    it('should show plugin details in dialog', () => {
      render(<PluginsPage />)

      const githubCard = screen.getByTestId('plugin-github')
      fireEvent.click(githubCard)

      const dialog = screen.getByTestId('plugin-details-dialog')
      expect(dialog).toBeInTheDocument()
      expect(screen.getByText('GitHub')).toBeInTheDocument()
    })

    it('should close dialog when close button is clicked', () => {
      render(<PluginsPage />)

      const githubCard = screen.getByTestId('plugin-github')
      fireEvent.click(githubCard)

      const closeBtn = screen.getByTestId('close-dialog-btn')
      fireEvent.click(closeBtn)

      expect(screen.queryByTestId('plugin-details-dialog')).not.toBeInTheDocument()
    })

    it('should show install button for non-installed plugins in dialog', () => {
      render(<PluginsPage />)

      const openaiCard = screen.getByTestId('plugin-openai')
      fireEvent.click(openaiCard)

      const installBtn = screen.getByTestId('dialog-install-btn')
      expect(installBtn).toBeInTheDocument()
      expect(installBtn).not.toBeDisabled()
    })

    it('should show disabled button for installed plugins in dialog', () => {
      render(<PluginsPage />)

      const githubCard = screen.getByTestId('plugin-github')
      fireEvent.click(githubCard)

      const installBtn = screen.getByTestId('dialog-install-btn')
      expect(installBtn).toBeDisabled()
    })
  })

  describe('Plugin Actions', () => {
    it('should handle plugin installation', () => {
      render(<PluginsPage />)

      const installBtn = screen.getByTestId('install-openai')
      fireEvent.click(installBtn)

      // Button should change to "Installed"
      expect(installBtn).toHaveTextContent('Installed')
      expect(installBtn).toBeDisabled()
    })

    it('should handle plugin uninstallation', () => {
      render(<PluginsPage />)

      const githubCard = screen.getByTestId('plugin-github')
      fireEvent.click(githubCard)

      const uninstallBtn = screen.getByTestId('dialog-uninstall-btn')
      fireEvent.click(uninstallBtn)

      // Dialog should close and plugin should be uninstalled
      expect(screen.queryByTestId('plugin-details-dialog')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper test IDs for all interactive elements', () => {
      render(<PluginsPage />)

      expect(screen.getByTestId('plugins-page')).toBeInTheDocument()
      expect(screen.getByTestId('plugins-search')).toBeInTheDocument()
      expect(screen.getByTestId('category-all')).toBeInTheDocument()
      expect(screen.getByTestId('status-all')).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('should show empty state when no plugins match filters', () => {
      render(<PluginsPage />)

      // Apply search that matches nothing
      const searchInput = screen.getByTestId('plugins-search') as HTMLInputElement
      fireEvent.change(searchInput, { target: { value: 'zzzznonexistent' } })

      expect(screen.getByText(/No plugins found/i)).toBeInTheDocument()
    })
  })
})
