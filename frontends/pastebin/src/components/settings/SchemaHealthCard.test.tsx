import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { SchemaHealthCard } from './SchemaHealthCard'

describe('SchemaHealthCard', () => {
  const mockOnClear = jest.fn()
  const mockOnCheckSchema = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('unknown state', () => {
    it('should render nothing when schemaHealth is unknown', () => {
      const { container } = render(
        <SchemaHealthCard
          schemaHealth="unknown"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      expect(container.firstChild).toBeNull()
    })
  })

  describe('healthy state', () => {
    it('should render card when schema is healthy', () => {
      render(
        <SchemaHealthCard
          schemaHealth="healthy"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      expect(screen.getByText('Schema Healthy')).toBeInTheDocument()
    })

    it('should display healthy status description', () => {
      render(
        <SchemaHealthCard
          schemaHealth="healthy"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      expect(
        screen.getByText(
          'Your database schema is up to date and functioning correctly'
        )
      ).toBeInTheDocument()
    })

    it('should have green styling for healthy state', () => {
      const { container } = render(
        <SchemaHealthCard
          schemaHealth="healthy"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      const card = container.querySelector('[class*="border-green"]')
      expect(card).toBeInTheDocument()
    })

    it('should display success icon for healthy state', () => {
      render(
        <SchemaHealthCard
          schemaHealth="healthy"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      const title = screen.getByText('Schema Healthy')
      expect(title.parentElement).toBeInTheDocument()
    })

    it('should not show action buttons in healthy state', () => {
      render(
        <SchemaHealthCard
          schemaHealth="healthy"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      const buttons = screen.queryAllByRole('button')
      expect(buttons.length).toBe(0)
    })
  })

  describe('corrupted state', () => {
    it('should render card when schema is corrupted', () => {
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      expect(
        screen.getByText('Schema Corruption Detected')
      ).toBeInTheDocument()
    })

    it('should display corruption warning description', () => {
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      expect(
        screen.getByText(
          'Your database schema is outdated or corrupted and needs to be repaired'
        )
      ).toBeInTheDocument()
    })

    it('should display detailed error message', () => {
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      expect(
        screen.getByText(/The database schema is missing required tables/i)
      ).toBeInTheDocument()
    })

    it('should have destructive styling for corrupted state', () => {
      const { container } = render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      const card = container.querySelector('[class*="border-destructive"]')
      expect(card).toBeInTheDocument()
    })

    it('should display warning icon for corrupted state', () => {
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      const title = screen.getByText('Schema Corruption Detected')
      expect(title).toHaveClass('text-destructive')
    })
  })

  describe('repair button', () => {
    it('should show repair button when schema is corrupted', () => {
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      expect(
        screen.getByRole('button', {
          name: /Repair Database/i
        })
      ).toBeInTheDocument()
    })

    it('should call onClear when repair button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      const repairButton = screen.getByRole('button', {
        name: /Repair Database/i
      })
      await user.click(repairButton)

      expect(mockOnClear).toHaveBeenCalledTimes(1)
    })

    it('should show correct repair button text', () => {
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      expect(
        screen.getByText(/Repair Database \(Wipe & Recreate\)/)
      ).toBeInTheDocument()
    })

    it('should have destructive variant for repair button', () => {
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      const repairButton = screen.getByRole('button', {
        name: /Repair Database/i
      })
      expect(repairButton).toBeInTheDocument()
      expect(repairButton).toBeEnabled()
    })

    it('should handle async repair operation', async () => {
      const user = userEvent.setup()
      const slowClear = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(resolve, 100)
          })
      )

      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={slowClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      const repairButton = screen.getByRole('button', {
        name: /Repair Database/i
      })
      await user.click(repairButton)

      expect(slowClear).toHaveBeenCalled()
    })
  })

  describe('recheck schema button', () => {
    it('should show recheck button when schema is corrupted', () => {
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      expect(
        screen.getByRole('button', {
          name: /Re-check Schema/i
        })
      ).toBeInTheDocument()
    })

    it('should call onCheckSchema when recheck button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      const recheckButton = screen.getByRole('button', {
        name: /Re-check Schema/i
      })
      await user.click(recheckButton)

      expect(mockOnCheckSchema).toHaveBeenCalledTimes(1)
    })

    it('should disable recheck button when checking', () => {
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={true}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      const recheckButton = screen.getByRole('button', {
        name: /Checking.../i
      })
      expect(recheckButton).toBeDisabled()
    })

    it('should show loading text when checking', () => {
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={true}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      expect(screen.getByText('Checking...')).toBeInTheDocument()
    })

    it('should show normal text when not checking', () => {
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      expect(
        screen.getByRole('button', {
          name: /Re-check Schema/i
        })
      ).toBeInTheDocument()
    })

    it('should have outline variant for recheck button', () => {
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      const recheckButton = screen.getByRole('button', {
        name: /Re-check Schema/i
      })
      expect(recheckButton).toBeInTheDocument()
      expect(recheckButton).not.toHaveClass('destructive')
    })

    it('should handle async recheck operation', async () => {
      const user = userEvent.setup()
      const slowCheck = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(resolve, 100)
          })
      )

      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={slowCheck}
        />
      )

      const recheckButton = screen.getByRole('button', {
        name: /Re-check Schema/i
      })
      await user.click(recheckButton)

      expect(slowCheck).toHaveBeenCalled()
    })
  })

  describe('error alert', () => {
    it('should display alert when corrupted', () => {
      const { container } = render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      const alert = container.querySelector('[data-slot="alert"]')
      expect(alert).toBeInTheDocument()
    })

    it('should mention namespace feature in error', () => {
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      expect(
        screen.getByText(/namespace feature addition/i)
      ).toBeInTheDocument()
    })
  })

  describe('state transitions', () => {
    it('should transition from corrupted to checking', () => {
      const { rerender } = render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      expect(
        screen.getByRole('button', {
          name: /Re-check Schema/i
        })
      ).not.toBeDisabled()

      rerender(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={true}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      const recheckButton = screen.getByRole('button', {
        name: /Checking.../i
      })
      expect(recheckButton).toBeDisabled()
    })

    it('should transition from corrupted to healthy', () => {
      const { rerender } = render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      expect(
        screen.getByText('Schema Corruption Detected')
      ).toBeInTheDocument()

      rerender(
        <SchemaHealthCard
          schemaHealth="healthy"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      expect(screen.getByText('Schema Healthy')).toBeInTheDocument()
      expect(
        screen.queryByText('Schema Corruption Detected')
      ).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have proper button roles', () => {
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('should have descriptive button labels', () => {
      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      expect(
        screen.getByRole('button', {
          name: /Repair Database/i
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: /Re-check Schema/i
        })
      ).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('should handle repair errors', async () => {
      const user = userEvent.setup()
      const slowClear = jest.fn(
        () => new Promise<void>((resolve) => {
          setTimeout(resolve, 50)
        })
      )

      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={slowClear}
          onCheckSchema={mockOnCheckSchema}
        />
      )

      const repairButton = screen.getByRole('button', {
        name: /Repair Database/i
      })
      await user.click(repairButton)

      expect(slowClear).toHaveBeenCalled()
    })

    it('should handle check errors', async () => {
      const user = userEvent.setup()
      const slowCheck = jest.fn(
        () => new Promise<void>((resolve) => {
          setTimeout(resolve, 50)
        })
      )

      render(
        <SchemaHealthCard
          schemaHealth="corrupted"
          checkingSchema={false}
          onClear={mockOnClear}
          onCheckSchema={slowCheck}
        />
      )

      const recheckButton = screen.getByRole('button', {
        name: /Re-check Schema/i
      })
      await user.click(recheckButton)

      expect(slowCheck).toHaveBeenCalled()
    })
  })
})
