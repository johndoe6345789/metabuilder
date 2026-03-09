import React from 'react'
import { render, screen } from '@/test-utils'
import { BackendAutoConfigCard } from './BackendAutoConfigCard'

describe('BackendAutoConfigCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering when not configured', () => {
    it('should render nothing when envVarSet is false', () => {
      const { container } = render(
        <BackendAutoConfigCard
          envVarSet={false}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('rendering when configured', () => {
    it('should render card when envVarSet is true', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
        />
      )

      expect(
        screen.getByText('Backend Auto-Configured')
      ).toBeInTheDocument()
    })

    it('should render card title', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
        />
      )

      expect(
        screen.getByText('Backend Auto-Configured')
      ).toBeInTheDocument()
    })

    it('should have accent styling when configured', () => {
      const { container } = render(
        <BackendAutoConfigCard
          envVarSet={true}
        />
      )

      const card = container.querySelector('[data-testid="backend-auto-config-card"]')
      expect(card).toBeInTheDocument()
    })

    it('should display title with accent color', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
        />
      )

      const title = screen.getByText('Backend Auto-Configured')
      expect(title).toHaveClass('cardTitleAccent')
    })
  })

  describe('backend URL display', () => {
    it('should display backend URL label', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
        />
      )

      expect(screen.getByText('Backend URL')).toBeInTheDocument()
    })

    it('should use monospace font for URL', () => {
      const { container } = render(
        <BackendAutoConfigCard
          envVarSet={true}
        />
      )

      const urlElement = container.querySelector('[data-testid="backend-url"] code')
      expect(urlElement).toBeInTheDocument()
    })
  })

  describe('configuration source display', () => {
    it('should display configuration source label', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
        />
      )

      expect(
        screen.getByText('Configuration Source')
      ).toBeInTheDocument()
    })

    it('should display env variable name', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
        />
      )

      expect(
        screen.getByText('NEXT_PUBLIC_DBAL_API_URL')
      ).toBeInTheDocument()
    })

    it('should use monospace font for env variable', () => {
      const { container } = render(
        <BackendAutoConfigCard
          envVarSet={true}
        />
      )

      const codeElements = container.querySelectorAll('code')
      expect(codeElements.length).toBeGreaterThan(0)
    })
  })

  describe('conditional rendering', () => {
    it('should only render when envVarSet changes from false to true', () => {
      const { rerender, container } = render(
        <BackendAutoConfigCard
          envVarSet={false}
        />
      )

      expect(container.firstChild).toBeNull()

      rerender(
        <BackendAutoConfigCard
          envVarSet={true}
        />
      )

      expect(
        screen.getByText('Backend Auto-Configured')
      ).toBeInTheDocument()
    })

    it('should maintain rendered state when envVarSet stays true', () => {
      const { rerender } = render(
        <BackendAutoConfigCard
          envVarSet={true}
        />
      )

      expect(
        screen.getByText('Backend Auto-Configured')
      ).toBeInTheDocument()

      rerender(
        <BackendAutoConfigCard
          envVarSet={true}
        />
      )

      expect(
        screen.getByText('Backend Auto-Configured')
      ).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have readable labels', () => {
      render(
        <BackendAutoConfigCard
          envVarSet={true}
        />
      )

      expect(screen.getByText('Backend URL')).toBeInTheDocument()
      expect(
        screen.getByText('Configuration Source')
      ).toBeInTheDocument()
    })
  })
})
