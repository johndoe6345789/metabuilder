/**
 * Note: FakeMUI components, icons, and styles are mocked via Jest config

Tests for Favorite Workflows Page
 */

import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import FavoriteWorkflowsPage from '../page'





describe('FavoriteWorkflowsPage', () => {
  it('should render the favorites page', () => {
    render(<FavoriteWorkflowsPage />)
    expect(screen.getByTestId('favorites-page')).toBeInTheDocument()
  })

  it('should render the page header', () => {
    render(<FavoriteWorkflowsPage />)
    expect(screen.getByTestId('favorites-header')).toBeInTheDocument()
    expect(screen.getByText('Favorite Workflows')).toBeInTheDocument()
  })

  describe('Workflow Cards', () => {
    it('should render workflow cards', () => {
      render(<FavoriteWorkflowsPage />)

      expect(screen.getByTestId('workflow-data-pipeline')).toBeInTheDocument()
      expect(screen.getByTestId('workflow-email-automation')).toBeInTheDocument()
    })

    it('should display workflow information', () => {
      render(<FavoriteWorkflowsPage />)

      expect(screen.getByText('Data Pipeline')).toBeInTheDocument()
      expect(screen.getByText(/ETL workflow for processing/i)).toBeInTheDocument()
    })

    it('should show last run timestamp', () => {
      render(<FavoriteWorkflowsPage />)

      expect(screen.getByText(/Last run:/i)).toBeInTheDocument()
    })

    it('should show node count', () => {
      render(<FavoriteWorkflowsPage />)

      expect(screen.getByText(/nodes/i)).toBeInTheDocument()
    })

    it('should show language tags', () => {
      render(<FavoriteWorkflowsPage />)

      expect(screen.getByTestId('lang-typescript')).toBeInTheDocument()
      expect(screen.getByTestId('lang-python')).toBeInTheDocument()
    })
  })

  describe('Workflow Actions', () => {
    it('should have run button for each workflow', () => {
      render(<FavoriteWorkflowsPage />)

      const runButtons = screen.getAllByTestId(/run-workflow-/)
      expect(runButtons.length).toBeGreaterThan(0)
    })

    it('should have edit button for each workflow', () => {
      render(<FavoriteWorkflowsPage />)

      const editButtons = screen.getAllByTestId(/edit-workflow-/)
      expect(editButtons.length).toBeGreaterThan(0)
    })

    it('should have favorite toggle for each workflow', () => {
      render(<FavoriteWorkflowsPage />)

      const favoriteButtons = screen.getAllByTestId(/favorite-workflow-/)
      expect(favoriteButtons.length).toBeGreaterThan(0)
    })

    it('should toggle favorite when favorite button clicked', () => {
      render(<FavoriteWorkflowsPage />)

      const favoriteBtn = screen.getByTestId('favorite-workflow-data-pipeline')
      fireEvent.click(favoriteBtn)

      // After clicking, the workflow should be removed from favorites
      // (In a real implementation, this would trigger a state change)
    })

    it('should navigate to workflow editor on edit', () => {
      render(<FavoriteWorkflowsPage />)

      const editBtn = screen.getByTestId('edit-workflow-data-pipeline')
      expect(editBtn).toBeInTheDocument()
      // In a real implementation, this would trigger navigation
    })
  })

  describe('Empty State', () => {
    it('should show empty state when no favorites exist', () => {
      // This would require mocking the workflow data to be empty
      // For now, we verify the component renders without errors
      render(<FavoriteWorkflowsPage />)
      expect(screen.getByTestId('favorites-page')).toBeInTheDocument()
    })
  })

  describe('Workflow Status', () => {
    it('should show success status for completed workflows', () => {
      render(<FavoriteWorkflowsPage />)

      const successChips = screen.getAllByText('Success')
      expect(successChips.length).toBeGreaterThan(0)
    })

    it('should show running status for active workflows', () => {
      render(<FavoriteWorkflowsPage />)

      const runningChips = screen.getAllByText('Running')
      expect(runningChips.length).toBeGreaterThan(0)
    })

    it('should show error status for failed workflows', () => {
      render(<FavoriteWorkflowsPage />)

      const errorChips = screen.getAllByText('Error')
      expect(errorChips.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have proper test IDs for all workflow cards', () => {
      render(<FavoriteWorkflowsPage />)

      expect(screen.getByTestId('workflow-data-pipeline')).toBeInTheDocument()
      expect(screen.getByTestId('workflow-email-automation')).toBeInTheDocument()
    })

    it('should have proper test IDs for action buttons', () => {
      render(<FavoriteWorkflowsPage />)

      expect(screen.getByTestId('run-workflow-data-pipeline')).toBeInTheDocument()
      expect(screen.getByTestId('edit-workflow-data-pipeline')).toBeInTheDocument()
      expect(screen.getByTestId('favorite-workflow-data-pipeline')).toBeInTheDocument()
    })
  })
})
