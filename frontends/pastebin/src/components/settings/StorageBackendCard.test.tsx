import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { StorageBackendCard } from './StorageBackendCard'

describe('StorageBackendCard', () => {
  const mockOnStorageBackendChange = jest.fn()
  const mockOnSaveConfig = jest.fn()

  const defaultProps = {
    storageBackend: 'indexeddb' as const,
    envVarSet: false,
    onStorageBackendChange: mockOnStorageBackendChange,
    onSaveConfig: mockOnSaveConfig,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render card with title', () => {
      render(<StorageBackendCard {...defaultProps} />)

      expect(screen.getByText('Storage Backend')).toBeInTheDocument()
    })

    it('should render card description', () => {
      render(<StorageBackendCard {...defaultProps} />)

      expect(
        screen.getByText('Choose where your snippets are stored')
      ).toBeInTheDocument()
    })

    it('should render radio buttons for storage options', () => {
      render(<StorageBackendCard {...defaultProps} />)

      expect(
        screen.getByText('IndexedDB (Local Browser Storage)')
      ).toBeInTheDocument()
      expect(
        screen.getByText('DBAL Backend (Remote Server)')
      ).toBeInTheDocument()
    })
  })

  describe('IndexedDB option', () => {
    it('should display IndexedDB radio option', () => {
      render(<StorageBackendCard {...defaultProps} />)

      expect(
        screen.getByText('IndexedDB (Local Browser Storage)')
      ).toBeInTheDocument()
    })

    it('should display IndexedDB description', () => {
      render(<StorageBackendCard {...defaultProps} />)

      expect(
        screen.getByText(/Store snippets locally in your browser/i)
      ).toBeInTheDocument()
    })

    it('should select IndexedDB when storageBackend is indexeddb', () => {
      const { container } = render(
        <StorageBackendCard {...defaultProps} storageBackend="indexeddb" />
      )

      const indexeddbRadio = container.querySelector(
        'input[id="storage-indexeddb"]'
      ) as HTMLInputElement
      expect(indexeddbRadio?.checked).toBe(true)
    })

    it('should not select IndexedDB when storageBackend is dbal', () => {
      const { container } = render(
        <StorageBackendCard {...defaultProps} storageBackend="dbal" />
      )

      const indexeddbRadio = container.querySelector(
        'input[id="storage-indexeddb"]'
      ) as HTMLInputElement
      expect(indexeddbRadio?.checked).toBe(false)
    })
  })

  describe('DBAL option', () => {
    it('should display DBAL radio option', () => {
      render(<StorageBackendCard {...defaultProps} />)

      expect(
        screen.getByText('DBAL Backend (Remote Server)')
      ).toBeInTheDocument()
    })

    it('should display DBAL description', () => {
      render(<StorageBackendCard {...defaultProps} />)

      expect(
        screen.getByText(/Store snippets on a DBAL backend server/i)
      ).toBeInTheDocument()
    })

    it('should select DBAL when storageBackend is dbal', () => {
      const { container } = render(
        <StorageBackendCard {...defaultProps} storageBackend="dbal" />
      )

      const dbalRadio = container.querySelector(
        'input[id="storage-dbal"]'
      ) as HTMLInputElement
      expect(dbalRadio?.checked).toBe(true)
    })

    it('should not select DBAL when storageBackend is indexeddb', () => {
      const { container } = render(
        <StorageBackendCard {...defaultProps} />
      )

      const dbalRadio = container.querySelector(
        'input[id="storage-dbal"]'
      ) as HTMLInputElement
      expect(dbalRadio?.checked).toBe(false)
    })
  })

  describe('backend selection', () => {
    it('should call onStorageBackendChange when IndexedDB is selected', async () => {
      const user = userEvent.setup()
      render(
        <StorageBackendCard {...defaultProps} storageBackend="dbal" />
      )

      const indexeddbRadio = screen.getByRole('radio', {
        name: /IndexedDB/i
      })
      await user.click(indexeddbRadio)

      expect(mockOnStorageBackendChange).toHaveBeenCalledWith('indexeddb')
    })

    it('should call onStorageBackendChange when DBAL is selected', async () => {
      const user = userEvent.setup()
      render(<StorageBackendCard {...defaultProps} />)

      const dbalRadio = screen.getByRole('radio', {
        name: /DBAL Backend/i
      })
      await user.click(dbalRadio)

      expect(mockOnStorageBackendChange).toHaveBeenCalledWith('dbal')
    })
  })

  describe('environment variable configuration', () => {
    it('should show alert when envVarSet is true', () => {
      render(<StorageBackendCard {...defaultProps} envVarSet={true} />)

      expect(
        screen.getByText(/Storage backend is configured via/i)
      ).toBeInTheDocument()
    })

    it('should show env var name in alert', () => {
      render(<StorageBackendCard {...defaultProps} envVarSet={true} />)

      expect(
        screen.getByText('NEXT_PUBLIC_DBAL_API_URL')
      ).toBeInTheDocument()
    })

    it('should disable backend selection when envVarSet is true', () => {
      const { container } = render(
        <StorageBackendCard {...defaultProps} envVarSet={true} />
      )

      const indexeddbRadio = container.querySelector(
        'input[id="storage-indexeddb"]'
      ) as HTMLInputElement
      const dbalRadio = container.querySelector(
        'input[id="storage-dbal"]'
      ) as HTMLInputElement

      expect(indexeddbRadio?.disabled).toBe(true)
      expect(dbalRadio?.disabled).toBe(true)
    })

    it('should disable save button when envVarSet is true', () => {
      render(<StorageBackendCard {...defaultProps} envVarSet={true} />)

      const saveButton = screen.getByRole('button', {
        name: /Save Storage Settings/i
      })
      expect(saveButton).toBeDisabled()
    })
  })

  describe('save button', () => {
    it('should show save button', () => {
      render(<StorageBackendCard {...defaultProps} />)

      expect(
        screen.getByRole('button', {
          name: /Save Storage Settings/i
        })
      ).toBeInTheDocument()
    })

    it('should call onSaveConfig when save button is clicked', async () => {
      const user = userEvent.setup()
      render(<StorageBackendCard {...defaultProps} envVarSet={false} />)

      const saveButton = screen.getByRole('button', {
        name: /Save Storage Settings/i
      })
      await user.click(saveButton)

      expect(mockOnSaveConfig).toHaveBeenCalledTimes(1)
    })

    it('should enable save button when envVarSet is false', () => {
      render(<StorageBackendCard {...defaultProps} envVarSet={false} />)

      const saveButton = screen.getByRole('button', {
        name: /Save Storage Settings/i
      })
      expect(saveButton).not.toBeDisabled()
    })

    it('should handle async save operation', async () => {
      const user = userEvent.setup()
      const slowSave = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(resolve, 100)
          })
      )

      render(
        <StorageBackendCard
          {...defaultProps}
          onSaveConfig={slowSave}
        />
      )

      const saveButton = screen.getByRole('button', {
        name: /Save Storage Settings/i
      })
      await user.click(saveButton)

      expect(slowSave).toHaveBeenCalled()
    })
  })

  describe('state transitions', () => {
    it('should transition from IndexedDB to DBAL', () => {
      const { rerender } = render(
        <StorageBackendCard {...defaultProps} storageBackend="indexeddb" />
      )

      rerender(
        <StorageBackendCard {...defaultProps} storageBackend="dbal" />
      )

      const { container } = render(
        <StorageBackendCard {...defaultProps} storageBackend="dbal" />
      )

      const dbalRadio = container.querySelector(
        'input[id="storage-dbal"]'
      ) as HTMLInputElement
      expect(dbalRadio?.checked).toBe(true)
    })

    it('should transition from DBAL to IndexedDB', () => {
      const { rerender } = render(
        <StorageBackendCard {...defaultProps} storageBackend="dbal" />
      )

      rerender(
        <StorageBackendCard {...defaultProps} storageBackend="indexeddb" />
      )

      const { container } = render(
        <StorageBackendCard {...defaultProps} storageBackend="indexeddb" />
      )

      const indexeddbRadio = container.querySelector(
        'input[id="storage-indexeddb"]'
      ) as HTMLInputElement
      expect(indexeddbRadio?.checked).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('should have labels for radio options', () => {
      render(<StorageBackendCard {...defaultProps} />)

      expect(
        screen.getByLabelText(/IndexedDB \(Local Browser Storage\)/i)
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(/DBAL Backend \(Remote Server\)/i)
      ).toBeInTheDocument()
    })
  })
})
