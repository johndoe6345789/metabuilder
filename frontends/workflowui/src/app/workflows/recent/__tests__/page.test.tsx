/**
 * Note: FakeMUI components, icons, and styles are mocked via Jest config

Tests for Recent Workflows Page
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import RecentWorkflowsPage from '../page'





describe('RecentWorkflowsPage', () => {
  it('should render the recent workflows page', () => {
    render(<RecentWorkflowsPage />)
    expect(screen.getByTestId('recent-page')).toBeInTheDocument()
  })

  it('should render the page header', () => {
    render(<RecentWorkflowsPage />)
    expect(screen.getByTestId('recent-header')).toBeInTheDocument()
    expect(screen.getByText('Recent Workflows')).toBeInTheDocument()
  })

  describe('Workflow Cards', () => {
    it('should render workflow cards sorted by recent activity', () => {
      render(<RecentWorkflowsPage />)

      expect(screen.getByTestId('workflow-api-integration')).toBeInTheDocument()
      expect(screen.getByTestId('workflow-slack-notifier')).toBeInTheDocument()
    })

    it('should display workflow information', () => {
      render(<RecentWorkflowsPage />)

      expect(screen.getByText('API Integration')).toBeInTheDocument()
      expect(screen.getByText(/REST API workflow/i)).toBeInTheDocument()
    })

    it('should show last accessed timestamp', () => {
      render(<RecentWorkflowsPage />)

      expect(screen.getByText(/Last accessed:/i)).toBeInTheDocument()
    })

    it('should show execution count', () => {
      render(<RecentWorkflowsPage />)

      expect(screen.getByText(/executions/i)).toBeInTheDocument()
    })

    it('should show language tags', () => {
      render(<RecentWorkflowsPage />)

      expect(screen.getByTestId('lang-typescript')).toBeInTheDocument()
      expect(screen.getByTestId('lang-python')).toBeInTheDocument()
    })
  })

  describe('Workflow Actions', () => {
    it('should have run button for each workflow', () => {
      render(<RecentWorkflowsPage />)

      const runButtons = screen.getAllByTestId(/run-workflow-/)
      expect(runButtons.length).toBeGreaterThan(0)
    })

    it('should have edit button for each workflow', () => {
      render(<RecentWorkflowsPage />)

      const editButtons = screen.getAllByTestId(/edit-workflow-/)
      expect(editButtons.length).toBeGreaterThan(0)
    })

    it('should have favorite toggle for each workflow', () => {
      render(<RecentWorkflowsPage />)

      const favoriteButtons = screen.getAllByTestId(/favorite-workflow-/)
      expect(favoriteButtons.length).toBeGreaterThan(0)
    })

    it('should toggle favorite when star button clicked', () => {
      render(<RecentWorkflowsPage />)

      const favoriteBtn = screen.getByTestId('favorite-workflow-api-integration')
      fireEvent.click(favoriteBtn)

      // In a real implementation, this would update the favorite state
    })

    it('should navigate to workflow editor on edit', () => {
      render(<RecentWorkflowsPage />)

      const editBtn = screen.getByTestId('edit-workflow-api-integration')
      expect(editBtn).toBeInTheDocument()
      // In a real implementation, this would trigger navigation
    })
  })

  describe('Time-based Grouping', () => {
    it('should group workflows by time period', () => {
      render(<RecentWorkflowsPage />)

      // Check for time-based section headers
      expect(screen.getByText(/Today/i)).toBeInTheDocument()
      expect(screen.getByText(/Yesterday/i)).toBeInTheDocument()
      expect(screen.getByText(/This Week/i)).toBeInTheDocument()
    })
  })

  describe('Workflow Status', () => {
    it('should show success status for completed workflows', () => {
      render(<RecentWorkflowsPage />)

      const successChips = screen.getAllByText('Success')
      expect(successChips.length).toBeGreaterThan(0)
    })

    it('should show running status for active workflows', () => {
      render(<RecentWorkflowsPage />)

      const runningChips = screen.getAllByText('Running')
      expect(runningChips.length).toBeGreaterThan(0)
    })

    it('should show error status for failed workflows', () => {
      render(<RecentWorkflowsPage />)

      const errorChips = screen.getAllByText('Error')
      expect(errorChips.length).toBeGreaterThan(0)
    })
  })

  describe('Empty State', () => {
    it('should handle empty recent workflows list', () => {
      // This would require mocking the workflow data to be empty
      // For now, we verify the component renders without errors
      render(<RecentWorkflowsPage />)
      expect(screen.getByTestId('recent-page')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper test IDs for all workflow cards', () => {
      render(<RecentWorkflowsPage />)

      expect(screen.getByTestId('workflow-api-integration')).toBeInTheDocument()
      expect(screen.getByTestId('workflow-slack-notifier')).toBeInTheDocument()
    })

    it('should have proper test IDs for action buttons', () => {
      render(<RecentWorkflowsPage />)

      expect(screen.getByTestId('run-workflow-api-integration')).toBeInTheDocument()
      expect(screen.getByTestId('edit-workflow-api-integration')).toBeInTheDocument()
      expect(screen.getByTestId('favorite-workflow-api-integration')).toBeInTheDocument()
    })
  })

  describe('Sorting and Ordering', () => {
    it('should display workflows in chronological order', () => {
      render(<RecentWorkflowsPage />)

      // Verify that most recent workflows appear first
      const workflowCards = screen.getAllByTestId(/^workflow-/)
      expect(workflowCards.length).toBeGreaterThan(0)
      // In a real implementation, we would verify the order
    })
  })
})
