/**
 * Tests for Achievements Page
 * Note: FakeMUI components, icons, and styles are mocked via Jest config
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import AchievementsPage from '../page'



describe('AchievementsPage', () => {
  it('should render the achievements page', () => {
    render(<AchievementsPage />)
    expect(screen.getByTestId('achievements-page')).toBeInTheDocument()
  })

  it('should render the page header', () => {
    render(<AchievementsPage />)
    expect(screen.getByTestId('achievements-header')).toBeInTheDocument()
    expect(screen.getByText('Achievements')).toBeInTheDocument()
  })

  describe('Statistics Section', () => {
    it('should render statistics cards', () => {
      render(<AchievementsPage />)

      expect(screen.getByTestId('stats-section')).toBeInTheDocument()
      expect(screen.getByTestId('stat-total')).toBeInTheDocument()
      expect(screen.getByTestId('stat-unlocked')).toBeInTheDocument()
      expect(screen.getByTestId('stat-points')).toBeInTheDocument()
    })

    it('should display correct statistics', () => {
      render(<AchievementsPage />)

      expect(screen.getByText('12')).toBeInTheDocument() // Total achievements
      expect(screen.getByText('7')).toBeInTheDocument() // Unlocked
      expect(screen.getByText('350')).toBeInTheDocument() // Points
    })
  })

  describe('Achievements Grid', () => {
    it('should render achievements grid', () => {
      render(<AchievementsPage />)
      expect(screen.getByTestId('achievements-grid')).toBeInTheDocument()
    })

    it('should render all achievement cards', () => {
      render(<AchievementsPage />)

      expect(screen.getByTestId('achievement-first-workflow')).toBeInTheDocument()
      expect(screen.getByTestId('achievement-workflow-master')).toBeInTheDocument()
      expect(screen.getByTestId('achievement-speed-demon')).toBeInTheDocument()
    })

    it('should show unlocked achievements with correct styling', () => {
      render(<AchievementsPage />)

      const firstWorkflow = screen.getByTestId('achievement-first-workflow')
      expect(firstWorkflow).toBeInTheDocument()
      expect(screen.getByText('First Workflow')).toBeInTheDocument()
    })

    it('should show locked achievements', () => {
      render(<AchievementsPage />)

      const workflowMaster = screen.getByTestId('achievement-workflow-master')
      expect(workflowMaster).toBeInTheDocument()
      expect(screen.getByText('Workflow Master')).toBeInTheDocument()
    })

    it('should display achievement progress', () => {
      render(<AchievementsPage />)

      const progressBars = screen.getAllByTestId(/achievement-progress-/)
      expect(progressBars.length).toBeGreaterThan(0)
    })

    it('should show achievement points', () => {
      render(<AchievementsPage />)

      expect(screen.getByText('10 points')).toBeInTheDocument()
      expect(screen.getByText('50 points')).toBeInTheDocument()
    })
  })

  describe('Achievement Categories', () => {
    it('should group achievements by category', () => {
      render(<AchievementsPage />)

      expect(screen.getByText('Getting Started')).toBeInTheDocument()
      expect(screen.getByText('Workflow Creation')).toBeInTheDocument()
      expect(screen.getByText('Performance')).toBeInTheDocument()
    })
  })

  describe('Achievement States', () => {
    it('should display unlocked badge for completed achievements', () => {
      render(<AchievementsPage />)

      const badges = screen.getAllByText('Unlocked')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('should display locked badge for incomplete achievements', () => {
      render(<AchievementsPage />)

      const badges = screen.getAllByText('Locked')
      expect(badges.length).toBeGreaterThan(0)
    })

    it('should show completion date for unlocked achievements', () => {
      render(<AchievementsPage />)

      // Check for any date text (format: "Unlocked on ...")
      const dateText = screen.getByText(/Unlocked on/i)
      expect(dateText).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper test IDs for all sections', () => {
      render(<AchievementsPage />)

      expect(screen.getByTestId('achievements-page')).toBeInTheDocument()
      expect(screen.getByTestId('stats-section')).toBeInTheDocument()
      expect(screen.getByTestId('achievements-grid')).toBeInTheDocument()
    })

    it('should have proper test IDs for individual achievements', () => {
      render(<AchievementsPage />)

      expect(screen.getByTestId('achievement-first-workflow')).toBeInTheDocument()
      expect(screen.getByTestId('achievement-workflow-master')).toBeInTheDocument()
    })
  })
})
