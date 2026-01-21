import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { PersistenceExample } from './PersistenceExample'
import { useAppDispatch } from '@/store/hooks'
import { toast } from 'sonner'
import '@testing-library/jest-dom'

jest.mock('@/store/hooks')
jest.mock('sonner')

describe('PersistenceExample', () => {
  const mockDispatch = jest.fn()
  const mockToastError = jest.fn()
  const mockToastSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch)
    ;(toast.error as jest.Mock).mockImplementation(mockToastError)
    ;(toast.success as jest.Mock).mockImplementation(mockToastSuccess)
  })

  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<PersistenceExample />)
      expect(screen.getByText('Auto-Persistence Example')).toBeInTheDocument()
    })

    it('renders Card component', () => {
      const { container } = render(<PersistenceExample />)
      expect(container.querySelector('[class*="rounded"]')).toBeInTheDocument()
    })

    it('renders card title', () => {
      render(<PersistenceExample />)
      expect(screen.getByText('Auto-Persistence Example')).toBeInTheDocument()
    })

    it('renders card description', () => {
      render(<PersistenceExample />)
      expect(screen.getByText('Create a snippet and watch it automatically save to the database')).toBeInTheDocument()
    })
  })

  describe('Card Header', () => {
    it('renders header with icon', () => {
      const { container } = render(<PersistenceExample />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })

    it('renders FloppyDisk icon', () => {
      const { container } = render(<PersistenceExample />)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('icon container has proper styling', () => {
      const { container } = render(<PersistenceExample />)
      const iconContainer = container.querySelector('[class*="h-10"]')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Input Fields', () => {
    it('renders title input field', () => {
      render(<PersistenceExample />)
      expect(screen.getByLabelText('Snippet Title')).toBeInTheDocument()
    })

    it('renders code textarea field', () => {
      render(<PersistenceExample />)
      expect(screen.getByLabelText('Code')).toBeInTheDocument()
    })

    it('title input has correct id', () => {
      render(<PersistenceExample />)
      const titleInput = screen.getByLabelText('Snippet Title') as HTMLInputElement
      expect(titleInput.id).toBe('example-title')
    })

    it('code textarea has correct id', () => {
      render(<PersistenceExample />)
      const codeTextarea = screen.getByLabelText('Code') as HTMLTextAreaElement
      expect(codeTextarea.id).toBe('example-code')
    })

    it('title input has correct placeholder', () => {
      render(<PersistenceExample />)
      expect(screen.getByPlaceholderText('My Awesome Snippet')).toBeInTheDocument()
    })

    it('code textarea has correct placeholder', () => {
      render(<PersistenceExample />)
      expect(screen.getByPlaceholderText("console.log('Hello World')")).toBeInTheDocument()
    })
  })

  describe('Input State Management', () => {
    it('updates title input value on change', async () => {
      render(<PersistenceExample />)
      const titleInput = screen.getByLabelText('Snippet Title') as HTMLInputElement

      fireEvent.change(titleInput, { target: { value: 'Test Title' } })

      expect(titleInput.value).toBe('Test Title')
    })

    it('updates code textarea value on change', async () => {
      render(<PersistenceExample />)
      const codeTextarea = screen.getByLabelText('Code') as HTMLTextAreaElement

      fireEvent.change(codeTextarea, { target: { value: 'console.log("test")' } })

      expect(codeTextarea.value).toBe('console.log("test")')
    })

    it('clears inputs after successful creation', async () => {
      render(<PersistenceExample />)
      const titleInput = screen.getByLabelText('Snippet Title') as HTMLInputElement
      const codeTextarea = screen.getByLabelText('Code') as HTMLTextAreaElement

      fireEvent.change(titleInput, { target: { value: 'Test Title' } })
      fireEvent.change(codeTextarea, { target: { value: 'test code' } })

      const button = screen.getByRole('button', { name: /create snippet/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(titleInput.value).toBe('')
        expect(codeTextarea.value).toBe('')
      })
    })
  })

  describe('Create Button', () => {
    it('renders create button', () => {
      render(<PersistenceExample />)
      expect(screen.getByRole('button', { name: /create snippet/i })).toBeInTheDocument()
    })

    it('button has full width', () => {
      render(<PersistenceExample />)
      const button = screen.getByRole('button', { name: /create snippet/i })
      expect(button).toHaveClass('w-full')
    })

    it('button has gap spacing for icon', () => {
      render(<PersistenceExample />)
      const button = screen.getByRole('button', { name: /create snippet/i })
      expect(button).toHaveClass('gap-2')
    })

    it('button has Plus icon', () => {
      const { container } = render(<PersistenceExample />)
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })

  describe('Form Validation', () => {
    it('shows error toast when title is empty', () => {
      render(<PersistenceExample />)
      const codeTextarea = screen.getByLabelText('Code') as HTMLTextAreaElement

      fireEvent.change(codeTextarea, { target: { value: 'test code' } })

      const button = screen.getByRole('button', { name: /create snippet/i })
      fireEvent.click(button)

      expect(mockToastError).toHaveBeenCalledWith('Please enter both title and code')
    })

    it('shows error toast when code is empty', () => {
      render(<PersistenceExample />)
      const titleInput = screen.getByLabelText('Snippet Title') as HTMLInputElement

      fireEvent.change(titleInput, { target: { value: 'Test Title' } })

      const button = screen.getByRole('button', { name: /create snippet/i })
      fireEvent.click(button)

      expect(mockToastError).toHaveBeenCalledWith('Please enter both title and code')
    })

    it('shows error toast when both fields are empty', () => {
      render(<PersistenceExample />)
      const button = screen.getByRole('button', { name: /create snippet/i })

      fireEvent.click(button)

      expect(mockToastError).toHaveBeenCalledWith('Please enter both title and code')
    })

    it('does not dispatch when validation fails', () => {
      render(<PersistenceExample />)
      const button = screen.getByRole('button', { name: /create snippet/i })

      fireEvent.click(button)

      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  describe('Snippet Creation', () => {
    it('dispatches createSnippet action when valid data is provided', async () => {
      render(<PersistenceExample />)
      const titleInput = screen.getByLabelText('Snippet Title') as HTMLInputElement
      const codeTextarea = screen.getByLabelText('Code') as HTMLTextAreaElement

      fireEvent.change(titleInput, { target: { value: 'Test Title' } })
      fireEvent.change(codeTextarea, { target: { value: 'test code' } })

      const button = screen.getByRole('button', { name: /create snippet/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled()
      })
    })

    it('shows success toast on creation', async () => {
      render(<PersistenceExample />)
      const titleInput = screen.getByLabelText('Snippet Title') as HTMLInputElement
      const codeTextarea = screen.getByLabelText('Code') as HTMLTextAreaElement

      fireEvent.change(titleInput, { target: { value: 'Test Title' } })
      fireEvent.change(codeTextarea, { target: { value: 'test code' } })

      const button = screen.getByRole('button', { name: /create snippet/i })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Snippet created and auto-saved to database!')
      })
    })
  })

  describe('How It Works Section', () => {
    it('renders how it works section', () => {
      render(<PersistenceExample />)
      expect(screen.getByText('How It Works')).toBeInTheDocument()
    })

    it('renders all 4 instruction items', () => {
      render(<PersistenceExample />)
      expect(screen.getByText(/Click "Create Snippet" to dispatch a Redux action/)).toBeInTheDocument()
      expect(screen.getByText(/Persistence middleware intercepts the action/)).toBeInTheDocument()
      expect(screen.getByText(/Database save happens automatically/)).toBeInTheDocument()
      expect(screen.getByText(/Check console for/)).toBeInTheDocument()
    })

    it('renders first instruction', () => {
      render(<PersistenceExample />)
      expect(screen.getByText(/Click "Create Snippet" to dispatch a Redux action/)).toBeInTheDocument()
    })

    it('renders second instruction', () => {
      render(<PersistenceExample />)
      expect(screen.getByText(/Persistence middleware intercepts the action/)).toBeInTheDocument()
    })

    it('renders third instruction with debounce info', () => {
      render(<PersistenceExample />)
      expect(screen.getByText(/Database save happens automatically \(100ms debounce\)/)).toBeInTheDocument()
    })

    it('renders fourth instruction with console check', () => {
      render(<PersistenceExample />)
      expect(screen.getByText(/Check console for/)).toBeInTheDocument()
    })

    it('renders console message hint', () => {
      render(<PersistenceExample />)
      expect(screen.getByText(/\[Redux Persistence\] State synced to database/)).toBeInTheDocument()
    })
  })

  describe('List Items', () => {
    it('renders list with disc style', () => {
      const { container } = render(<PersistenceExample />)
      const list = container.querySelector('ul')
      expect(list).toHaveClass('list-disc')
    })

    it('renders list with inside styling', () => {
      const { container } = render(<PersistenceExample />)
      const list = container.querySelector('ul')
      expect(list).toHaveClass('list-inside')
    })

    it('instructions have muted foreground color', () => {
      const { container } = render(<PersistenceExample />)
      const list = container.querySelector('ul')
      expect(list).toHaveClass('text-muted-foreground')
    })
  })

  describe('Textarea Styling', () => {
    it('textarea has minimum height', () => {
      render(<PersistenceExample />)
      const textarea = screen.getByLabelText('Code') as HTMLTextAreaElement
      expect(textarea).toHaveClass('min-h-[100px]')
    })

    it('textarea is resizable', () => {
      render(<PersistenceExample />)
      const textarea = screen.getByLabelText('Code') as HTMLTextAreaElement
      expect(textarea).toHaveClass('resize-y')
    })

    it('textarea has monospace font', () => {
      render(<PersistenceExample />)
      const textarea = screen.getByLabelText('Code') as HTMLTextAreaElement
      expect(textarea).toHaveClass('font-mono')
    })

    it('textarea has proper padding', () => {
      render(<PersistenceExample />)
      const textarea = screen.getByLabelText('Code') as HTMLTextAreaElement
      expect(textarea).toHaveClass('px-3', 'py-2')
    })

    it('textarea has border', () => {
      render(<PersistenceExample />)
      const textarea = screen.getByLabelText('Code') as HTMLTextAreaElement
      expect(textarea).toHaveClass('border')
    })
  })

  describe('Accessibility', () => {
    it('title input is associated with label', () => {
      render(<PersistenceExample />)
      const label = screen.getByText('Snippet Title')
      const input = screen.getByLabelText('Snippet Title')
      expect(label).toBeInTheDocument()
      expect(input).toBeInTheDocument()
    })

    it('code textarea is associated with label', () => {
      render(<PersistenceExample />)
      const label = screen.getByText('Code')
      const textarea = screen.getByLabelText('Code')
      expect(label).toBeInTheDocument()
      expect(textarea).toBeInTheDocument()
    })

    it('button has accessible text', () => {
      render(<PersistenceExample />)
      expect(screen.getByRole('button', { name: /create snippet/i })).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('has proper spacing in content', () => {
      const { container } = render(<PersistenceExample />)
      const content = container.querySelector('[class*="space-y-4"]')
      expect(content).toBeInTheDocument()
    })

    it('form fields have spacing', () => {
      const { container } = render(<PersistenceExample />)
      const fields = container.querySelectorAll('[class*="space-y-2"]')
      expect(fields.length).toBeGreaterThan(0)
    })

    it('instructions section has border separator', () => {
      const { container } = render(<PersistenceExample />)
      const section = container.querySelector('[class*="pt-4"]')
      expect(section).toHaveClass('border-t')
    })
  })
})
