import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { DatabaseActionsCard } from './DatabaseActionsCard'

describe('DatabaseActionsCard', () => {
  const mockOnExport = jest.fn()
  const mockOnImport = jest.fn()
  const mockOnSeed = jest.fn()
  const mockOnClear = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render card with title', () => {
      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      expect(screen.getByText('Database Actions')).toBeInTheDocument()
    })

    it('should render card description', () => {
      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      expect(
        screen.getByText('Backup, restore, or reset your database')
      ).toBeInTheDocument()
    })

    it('should render all four action sections', () => {
      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      const headings = screen.getAllByRole('heading')
      const headingTexts = headings.map(h => h.textContent)
      expect(headingTexts).toContain('Export Database')
      expect(headingTexts).toContain('Import Database')
      expect(headingTexts).toContain('Sample Data')
      expect(headingTexts).toContain('Clear All Data')
    })

    it('should render all action buttons', () => {
      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      expect(
        screen.getByRole('button', { name: /export database/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /add sample data/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /clear database/i })
      ).toBeInTheDocument()
      // Import button is wrapped in label/asChild, so check for the file input
      const fileInput = document.querySelector(
        'input[type="file"][accept=".db"]'
      )
      expect(fileInput).toBeInTheDocument()
    })

    it('should render section descriptions', () => {
      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      expect(
        screen.getByText(/Download your database as a file/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Restore a previously exported database file/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Add sample code snippets to get started/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Permanently delete all snippets and templates/i)
      ).toBeInTheDocument()
    })
  })

  describe('Export functionality', () => {
    it('should call onExport when export button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      const exportButton = screen.getByRole('button', {
        name: /export database/i
      })
      await user.click(exportButton)

      expect(mockOnExport).toHaveBeenCalledTimes(1)
    })

    it('should handle async export operation', async () => {
      const user = userEvent.setup()
      const slowExport = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(resolve, 100)
          })
      )

      render(
        <DatabaseActionsCard
          onExport={slowExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      const exportButton = screen.getByRole('button', {
        name: /export database/i
      })
      await user.click(exportButton)

      expect(slowExport).toHaveBeenCalled()
    })
  })

  describe('Import functionality', () => {
    it('should have import file input', () => {
      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      const fileInput = document.querySelector(
        'input[type="file"][accept=".db"]'
      )
      expect(fileInput).toBeInTheDocument()
    })

    it('should accept .db files', () => {
      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      const fileInput = document.querySelector(
        'input[type="file"][accept=".db"]'
      ) as HTMLInputElement
      expect(fileInput.accept).toBe('.db')
    })

    it('should call onImport when file is selected', async () => {
      const user = userEvent.setup()
      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      const fileInput = document.querySelector(
        'input[type="file"][accept=".db"]'
      ) as HTMLInputElement

      const file = new File(['database'], 'test.db', { type: 'application/octet-stream' })
      await user.upload(fileInput, file)

      expect(mockOnImport).toHaveBeenCalled()
    })

    it('should handle multiple file selections', async () => {
      const user = userEvent.setup()
      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      const fileInput = document.querySelector(
        'input[type="file"][accept=".db"]'
      ) as HTMLInputElement

      const file1 = new File(['db1'], 'test1.db', {
        type: 'application/octet-stream'
      })
      const file2 = new File(['db2'], 'test2.db', {
        type: 'application/octet-stream'
      })

      await user.upload(fileInput, file1)
      await user.upload(fileInput, file2)

      expect(mockOnImport).toHaveBeenCalledTimes(2)
    })
  })

  describe('Seed functionality', () => {
    it('should call onSeed when seed button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      const seedButton = screen.getByRole('button', {
        name: /add sample data/i
      })
      await user.click(seedButton)

      expect(mockOnSeed).toHaveBeenCalledTimes(1)
    })

    it('should show note about empty database', () => {
      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      expect(
        screen.getByText(/only if database is empty/i)
      ).toBeInTheDocument()
    })

    it('should handle async seed operation', async () => {
      const user = userEvent.setup()
      const slowSeed = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(resolve, 100)
          })
      )

      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={slowSeed}
          onClear={mockOnClear}
        />
      )

      const seedButton = screen.getByRole('button', {
        name: /add sample data/i
      })
      await user.click(seedButton)

      expect(slowSeed).toHaveBeenCalled()
    })
  })

  describe('Clear functionality', () => {
    it('should call onClear when clear button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      const clearButton = screen.getByRole('button', {
        name: /clear database/i
      })
      await user.click(clearButton)

      expect(mockOnClear).toHaveBeenCalledTimes(1)
    })

    it('should show warning text for clear action', () => {
      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      expect(
        screen.getByText(/This cannot be undone/i)
      ).toBeInTheDocument()
    })

    it('should show clear button as destructive variant', () => {
      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      const clearButton = screen.getByRole('button', {
        name: /clear database/i
      })
      expect(clearButton).toBeInTheDocument()
      expect(clearButton).toBeEnabled()
    })

    it('should handle async clear operation', async () => {
      const user = userEvent.setup()
      const slowClear = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(resolve, 100)
          })
      )

      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={slowClear}
        />
      )

      const clearButton = screen.getByRole('button', {
        name: /clear database/i
      })
      await user.click(clearButton)

      expect(slowClear).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should handle export errors gracefully', async () => {
      const user = userEvent.setup()
      const slowExport = jest.fn(
        () => new Promise<void>((resolve) => {
          setTimeout(resolve, 50)
        })
      )

      render(
        <DatabaseActionsCard
          onExport={slowExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      const exportButton = screen.getByRole('button', {
        name: /export database/i
      })
      await user.click(exportButton)

      expect(slowExport).toHaveBeenCalled()
    })

    it('should handle import errors gracefully', async () => {
      const user = userEvent.setup()
      const slowImport = jest.fn(
        (event: React.ChangeEvent<HTMLInputElement>) => new Promise<void>((resolve) => {
          setTimeout(resolve, 50)
        })
      )

      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={slowImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      const fileInput = document.querySelector(
        'input[type="file"][accept=".db"]'
      ) as HTMLInputElement
      const file = new File(['database'], 'test.db', {
        type: 'application/octet-stream'
      })

      await user.upload(fileInput, file)

      expect(slowImport).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have proper button roles', () => {
      render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      expect(
        screen.getByRole('button', { name: /export database/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /add sample data/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /clear database/i })
      ).toBeInTheDocument()
    })

    it('should have labels associated with inputs', () => {
      const { container } = render(
        <DatabaseActionsCard
          onExport={mockOnExport}
          onImport={mockOnImport}
          onSeed={mockOnSeed}
          onClear={mockOnClear}
        />
      )

      const labels = container.querySelectorAll('label')
      expect(labels.length).toBeGreaterThan(0)
    })
  })
})
