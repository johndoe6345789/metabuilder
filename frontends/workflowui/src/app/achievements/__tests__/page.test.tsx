/**
 * Tests for Achievements Page
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import AchievementsPage from '../page'

describe('AchievementsPage', () => {
  it('should render the achievements page container', () => {
    render(<AchievementsPage />)
    expect(screen.getByTestId('achievements-page')).toBeInTheDocument()
  })

  it('should render the page title', () => {
    render(<AchievementsPage />)
    expect(screen.getByTestId('achievements-title')).toBeInTheDocument()
    expect(screen.getByText('Achievements')).toBeInTheDocument()
  })

  it('should render the page subtitle', () => {
    render(<AchievementsPage />)
    expect(screen.getByText('Track your progress and unlock achievements')).toBeInTheDocument()
  })

  describe('Statistics Cards', () => {
    it('should render the level card', () => {
      render(<AchievementsPage />)
      expect(screen.getByTestId('level-card')).toBeInTheDocument()
    })

    it('should render the points card', () => {
      render(<AchievementsPage />)
      expect(screen.getByTestId('points-card')).toBeInTheDocument()
    })

    it('should render the unlocked card', () => {
      render(<AchievementsPage />)
      expect(screen.getByTestId('unlocked-card')).toBeInTheDocument()
    })

    it('should display the total points from unlocked achievements', () => {
      render(<AchievementsPage />)
      // 5 unlocked achievements totaling 1200 points
      expect(screen.getByText('1,200')).toBeInTheDocument()
    })

    it('should display "Total Points" label', () => {
      render(<AchievementsPage />)
      expect(screen.getByText('Total Points')).toBeInTheDocument()
    })

    it('should display "Achievements Unlocked" label', () => {
      render(<AchievementsPage />)
      expect(screen.getByText('Achievements Unlocked')).toBeInTheDocument()
    })

    it('should show unlocked / total count', () => {
      render(<AchievementsPage />)
      expect(screen.getByText('5 / 12')).toBeInTheDocument()
    })
  })

  describe('Achievement Cards Grid', () => {
    it('should render achievement card for id 1', () => {
      render(<AchievementsPage />)
      expect(screen.getByTestId('achievement-1')).toBeInTheDocument()
    })

    it('should render achievement card for id 2', () => {
      render(<AchievementsPage />)
      expect(screen.getByTestId('achievement-2')).toBeInTheDocument()
    })

    it('should render all 12 achievement cards in "all" tab', () => {
      render(<AchievementsPage />)
      for (let i = 1; i <= 12; i++) {
        expect(screen.getByTestId(`achievement-${i}`)).toBeInTheDocument()
      }
    })

    it('should render "First Workflow" achievement title', () => {
      render(<AchievementsPage />)
      const matches = screen.getAllByText('First Workflow')
      expect(matches.length).toBeGreaterThan(0)
    })

    it('should render "Speed Demon" achievement title', () => {
      render(<AchievementsPage />)
      const matches = screen.getAllByText('Speed Demon')
      expect(matches.length).toBeGreaterThan(0)
    })

    it('should show progress bars for locked achievements with progress', () => {
      render(<AchievementsPage />)
      // LinearProgress renders with role="progressbar"
      const progressBars = screen.getAllByRole('progressbar')
      expect(progressBars.length).toBeGreaterThan(0)
    })

    it('should show unlocked check mark chips for unlocked achievements', () => {
      render(<AchievementsPage />)
      // Unlocked achievements have a Chip with label "✓"
      const checkmarks = screen.getAllByText('✓')
      expect(checkmarks.length).toBeGreaterThan(0)
    })
  })

  describe('Achievement Tabs', () => {
    it('should render achievement tabs', () => {
      render(<AchievementsPage />)
      expect(screen.getByTestId('achievement-tabs')).toBeInTheDocument()
    })

    it('should render All, Unlocked, and Locked tab buttons', () => {
      render(<AchievementsPage />)
      expect(screen.getByText('All')).toBeInTheDocument()
      expect(screen.getAllByText('Unlocked').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Locked').length).toBeGreaterThan(0)
    })
  })

  describe('Recent Unlocked', () => {
    it('should render recently unlocked section', () => {
      render(<AchievementsPage />)
      expect(screen.getByTestId('recent-achievements')).toBeInTheDocument()
    })

    it('should render "Recently Unlocked" heading', () => {
      render(<AchievementsPage />)
      expect(screen.getByText('Recently Unlocked')).toBeInTheDocument()
    })
  })
})
