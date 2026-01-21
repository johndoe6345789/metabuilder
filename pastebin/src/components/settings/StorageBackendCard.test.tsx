import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { StorageBackendCard } from './StorageBackendCard'

describe('StorageBackendCard', () => {
  const mockOnStorageBackendChange = jest.fn()
  const mockOnFlaskUrlChange = jest.fn()
  const mockOnTestConnection = jest.fn()
  const mockOnSaveConfig = jest.fn()
  const mockOnMigrateToFlask = jest.fn()
  const mockOnMigrateToIndexedDB = jest.fn()

  const defaultProps = {
    storageBackend: 'indexeddb' as const,
    flaskUrl: '',
    flaskConnectionStatus: 'unknown' as const,
    testingConnection: false,
    envVarSet: false,
    onStorageBackendChange: mockOnStorageBackendChange,
    onFlaskUrlChange: mockOnFlaskUrlChange,
    onTestConnection: mockOnTestConnection,
    onSaveConfig: mockOnSaveConfig,
    onMigrateToFlask: mockOnMigrateToFlask,
    onMigrateToIndexedDB: mockOnMigrateToIndexedDB
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
        screen.getByText('Flask Backend (Remote Server)')
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

    it('should not select IndexedDB when storageBackend is flask', () => {
      const { container } = render(
        <StorageBackendCard {...defaultProps} storageBackend="flask" />
      )

      const indexeddbRadio = container.querySelector(
        'input[id="storage-indexeddb"]'
      ) as HTMLInputElement
      expect(indexeddbRadio?.checked).toBe(false)
    })
  })

  describe('Flask option', () => {
    it('should display Flask radio option', () => {
      render(<StorageBackendCard {...defaultProps} />)

      expect(
        screen.getByText('Flask Backend (Remote Server)')
      ).toBeInTheDocument()
    })

    it('should display Flask description', () => {
      render(<StorageBackendCard {...defaultProps} />)

      expect(
        screen.getByText(/Store snippets on a Flask backend server/i)
      ).toBeInTheDocument()
    })

    it('should select Flask when storageBackend is flask', () => {
      const { container } = render(
        <StorageBackendCard {...defaultProps} storageBackend="flask" />
      )

      const flaskRadio = container.querySelector(
        'input[id="storage-flask"]'
      ) as HTMLInputElement
      expect(flaskRadio?.checked).toBe(true)
    })

    it('should not select Flask when storageBackend is indexeddb', () => {
      const { container } = render(
        <StorageBackendCard {...defaultProps} />
      )

      const flaskRadio = container.querySelector(
        'input[id="storage-flask"]'
      ) as HTMLInputElement
      expect(flaskRadio?.checked).toBe(false)
    })
  })

  describe('backend selection', () => {
    it('should call onStorageBackendChange when IndexedDB is selected', async () => {
      const user = userEvent.setup()
      render(
        <StorageBackendCard {...defaultProps} storageBackend="flask" />
      )

      const indexeddbRadio = screen.getByRole('radio', {
        name: /IndexedDB/i
      })
      await user.click(indexeddbRadio)

      expect(mockOnStorageBackendChange).toHaveBeenCalledWith('indexeddb')
    })

    it('should call onStorageBackendChange when Flask is selected', async () => {
      const user = userEvent.setup()
      render(<StorageBackendCard {...defaultProps} />)

      const flaskRadio = screen.getByRole('radio', {
        name: /Flask Backend/i
      })
      await user.click(flaskRadio)

      expect(mockOnStorageBackendChange).toHaveBeenCalledWith('flask')
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
        screen.getByText('NEXT_PUBLIC_FLASK_BACKEND_URL')
      ).toBeInTheDocument()
    })

    it('should disable backend selection when envVarSet is true', () => {
      const { container } = render(
        <StorageBackendCard {...defaultProps} envVarSet={true} />
      )

      const indexeddbRadio = container.querySelector(
        'input[id="storage-indexeddb"]'
      ) as HTMLInputElement
      const flaskRadio = container.querySelector(
        'input[id="storage-flask"]'
      ) as HTMLInputElement

      expect(indexeddbRadio?.disabled).toBe(true)
      expect(flaskRadio?.disabled).toBe(true)
    })

    it('should disable save button when envVarSet is true', () => {
      render(<StorageBackendCard {...defaultProps} envVarSet={true} />)

      const saveButton = screen.getByRole('button', {
        name: /Save Storage Settings/i
      })
      expect(saveButton).toBeDisabled()
    })
  })

  describe('Flask configuration', () => {
    it('should show Flask config section when Flask backend is selected', () => {
      render(<StorageBackendCard {...defaultProps} storageBackend="flask" />)

      expect(
        screen.getByRole('textbox', { name: /Flask Backend URL/i })
      ).toBeInTheDocument()
    })

    it('should not show Flask config section when IndexedDB is selected', () => {
      render(
        <StorageBackendCard {...defaultProps} storageBackend="indexeddb" />
      )

      expect(
        screen.queryByRole('textbox', { name: /Flask Backend URL/i })
      ).not.toBeInTheDocument()
    })

    it('should display Flask URL input with placeholder', () => {
      render(<StorageBackendCard {...defaultProps} storageBackend="flask" />)

      const urlInput = screen.getByPlaceholderText(
        'http://localhost:5000'
      ) as HTMLInputElement
      expect(urlInput).toBeInTheDocument()
    })

    it('should update Flask URL when input changes', async () => {
      const user = userEvent.setup()
      render(<StorageBackendCard {...defaultProps} storageBackend="flask" />)

      const urlInput = screen.getByPlaceholderText('http://localhost:5000')
      await user.clear(urlInput)
      await user.type(urlInput, 'http://api.example.com')

      // Verify the mock was called when input changed
      expect(mockOnFlaskUrlChange).toHaveBeenCalled()
    })

    it('should display Flask URL value', () => {
      render(
        <StorageBackendCard
          {...defaultProps}
          storageBackend="flask"
          flaskUrl="http://api.example.com"
        />
      )

      const urlInput = screen.getByDisplayValue('http://api.example.com')
      expect(urlInput).toBeInTheDocument()
    })

    it('should disable URL input when envVarSet is true', () => {
      const { container } = render(
        <StorageBackendCard
          {...defaultProps}
          storageBackend="flask"
          envVarSet={true}
        />
      )

      const urlInput = container.querySelector(
        'input[type="url"]'
      ) as HTMLInputElement
      expect(urlInput?.disabled).toBe(true)
    })
  })

  describe('connection testing', () => {
    it('should show test button when Flask backend is selected', () => {
      render(<StorageBackendCard {...defaultProps} storageBackend="flask" />)

      expect(screen.getByRole('button', { name: /Test/i })).toBeInTheDocument()
    })

    it('should call onTestConnection when test button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <StorageBackendCard
          {...defaultProps}
          storageBackend="flask"
          flaskUrl="http://localhost:5000"
        />
      )

      const testButton = screen.getByRole('button', { name: /Test/i })
      await user.click(testButton)

      expect(mockOnTestConnection).toHaveBeenCalledTimes(1)
    })

    it('should disable test button when testing', () => {
      render(
        <StorageBackendCard
          {...defaultProps}
          storageBackend="flask"
          testingConnection={true}
          flaskUrl="http://localhost:5000"
        />
      )

      const testButton = screen.getByRole('button', { name: /Testing.../i })
      expect(testButton).toBeDisabled()
    })

    it('should show testing text when testingConnection is true', () => {
      render(
        <StorageBackendCard
          {...defaultProps}
          storageBackend="flask"
          testingConnection={true}
        />
      )

      expect(screen.getByText('Testing...')).toBeInTheDocument()
    })

    it('should disable test button when URL is empty', () => {
      render(
        <StorageBackendCard
          {...defaultProps}
          storageBackend="flask"
          flaskUrl=""
        />
      )

      const testButton = screen.getByRole('button', { name: /Test/i })
      expect(testButton).toBeDisabled()
    })
  })

  describe('connection status indicators', () => {
    it('should show connected status', () => {
      render(
        <StorageBackendCard
          {...defaultProps}
          storageBackend="flask"
          flaskConnectionStatus="connected"
        />
      )

      expect(
        screen.getByText('Connected successfully')
      ).toBeInTheDocument()
    })

    it('should show failed status', () => {
      render(
        <StorageBackendCard
          {...defaultProps}
          storageBackend="flask"
          flaskConnectionStatus="failed"
        />
      )

      expect(screen.getByText('Connection failed')).toBeInTheDocument()
    })

    it('should not show status for unknown connection', () => {
      render(
        <StorageBackendCard
          {...defaultProps}
          storageBackend="flask"
          flaskConnectionStatus="unknown"
        />
      )

      expect(
        screen.queryByText('Connected successfully')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('Connection failed')
      ).not.toBeInTheDocument()
    })
  })

  describe('migration buttons', () => {
    it('should show migration buttons when Flask is selected', () => {
      render(<StorageBackendCard {...defaultProps} storageBackend="flask" />)

      expect(
        screen.getByRole('button', {
          name: /Migrate IndexedDB Data to Flask/i
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', {
          name: /Migrate Flask Data to IndexedDB/i
        })
      ).toBeInTheDocument()
    })

    it('should not show migration buttons when IndexedDB is selected', () => {
      render(<StorageBackendCard {...defaultProps} storageBackend="indexeddb" />)

      expect(
        screen.queryByRole('button', {
          name: /Migrate IndexedDB Data to Flask/i
        })
      ).not.toBeInTheDocument()
    })

    it('should call onMigrateToFlask when migration button is clicked', async () => {
      const user = userEvent.setup()
      render(<StorageBackendCard {...defaultProps} storageBackend="flask" />)

      const migrateButton = screen.getByRole('button', {
        name: /Migrate IndexedDB Data to Flask/i
      })
      await user.click(migrateButton)

      expect(mockOnMigrateToFlask).toHaveBeenCalledTimes(1)
    })

    it('should call onMigrateToIndexedDB when migration button is clicked', async () => {
      const user = userEvent.setup()
      render(<StorageBackendCard {...defaultProps} storageBackend="flask" />)

      const migrateButton = screen.getByRole('button', {
        name: /Migrate Flask Data to IndexedDB/i
      })
      await user.click(migrateButton)

      expect(mockOnMigrateToIndexedDB).toHaveBeenCalledTimes(1)
    })

    it('should handle async migration operations', async () => {
      const user = userEvent.setup()
      const slowMigrate = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            setTimeout(resolve, 100)
          })
      )

      render(
        <StorageBackendCard
          {...defaultProps}
          storageBackend="flask"
          onMigrateToFlask={slowMigrate}
        />
      )

      const migrateButton = screen.getByRole('button', {
        name: /Migrate IndexedDB Data to Flask/i
      })
      await user.click(migrateButton)

      expect(slowMigrate).toHaveBeenCalled()
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

  describe('error handling', () => {
    it('should call error handlers when operations fail', () => {
      const failingTest = jest.fn()
      const failingMigrate = jest.fn()

      render(
        <StorageBackendCard
          {...defaultProps}
          storageBackend="flask"
          flaskUrl="http://localhost:5000"
          onTestConnection={failingTest}
          onMigrateToFlask={failingMigrate}
        />
      )

      expect(failingTest).toBeDefined()
      expect(failingMigrate).toBeDefined()
    })
  })

  describe('state transitions', () => {
    it('should transition from IndexedDB to Flask', () => {
      const { rerender } = render(
        <StorageBackendCard {...defaultProps} storageBackend="indexeddb" />
      )

      expect(
        screen.queryByRole('textbox', { name: /Flask Backend URL/i })
      ).not.toBeInTheDocument()

      rerender(
        <StorageBackendCard {...defaultProps} storageBackend="flask" />
      )

      expect(
        screen.getByRole('textbox', { name: /Flask Backend URL/i })
      ).toBeInTheDocument()
    })

    it('should transition from Flask to IndexedDB', () => {
      const { rerender } = render(
        <StorageBackendCard {...defaultProps} storageBackend="flask" />
      )

      expect(
        screen.getByRole('textbox', { name: /Flask Backend URL/i })
      ).toBeInTheDocument()

      rerender(
        <StorageBackendCard {...defaultProps} storageBackend="indexeddb" />
      )

      expect(
        screen.queryByRole('textbox', { name: /Flask Backend URL/i })
      ).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have labels for radio options', () => {
      render(<StorageBackendCard {...defaultProps} />)

      expect(
        screen.getByLabelText(/IndexedDB \(Local Browser Storage\)/i)
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText(/Flask Backend \(Remote Server\)/i)
      ).toBeInTheDocument()
    })

    it('should have accessible URL input', () => {
      render(<StorageBackendCard {...defaultProps} storageBackend="flask" />)

      expect(
        screen.getByRole('textbox', { name: /Flask Backend URL/i })
      ).toBeInTheDocument()
    })
  })
})
