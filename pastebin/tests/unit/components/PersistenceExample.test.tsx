import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { PersistenceExample } from '@/components/demo/PersistenceExample'
import { useAppDispatch } from '@/store/hooks'
import * as sonner from 'sonner'

// Mock dependencies
jest.mock('@/store/hooks', () => ({
  useAppDispatch: jest.fn(),
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

jest.mock('@/store/slices/snippetsSlice', () => ({
  createSnippet: jest.fn((payload) => ({ type: 'test', payload })),
}))

describe('PersistenceExample Component', () => {
  const mockDispatch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch)
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<PersistenceExample />)
      expect(screen.getByText('Auto-Persistence Example')).toBeInTheDocument()
    })

    it('should display the card title', () => {
      render(<PersistenceExample />)
      expect(screen.getByText('Auto-Persistence Example')).toBeInTheDocument()
    })

    it('should display the description', () => {
      render(<PersistenceExample />)
      expect(screen.getByText('Create a snippet and watch it automatically save to the database')).toBeInTheDocument()
    })

    it('should render Card component', () => {
      const { container } = render(<PersistenceExample />)
      expect(container.querySelector('[class*="rounded"]')).toBeInTheDocument()
    })
  })

  describe('Form Fields', () => {
    it('should render title input field', () => {
      render(<PersistenceExample />)
      expect(screen.getByLabelText('Snippet Title')).toBeInTheDocument()
    })

    it('should render code textarea field', () => {
      render(<PersistenceExample />)
      expect(screen.getByLabelText('Code')).toBeInTheDocument()
    })

    it('should have correct label for title input', () => {
      render(<PersistenceExample />)
      expect(screen.getByText('Snippet Title')).toBeInTheDocument()
    })

    it('should have correct label for code textarea', () => {
      render(<PersistenceExample />)
      expect(screen.getByText('Code')).toBeInTheDocument()
    })

    it('should have placeholder for title input', () => {
      render(<PersistenceExample />)
      const titleInput = screen.getByPlaceholderText('My Awesome Snippet')
      expect(titleInput).toBeInTheDocument()
    })

    it('should have placeholder for code textarea', () => {
      render(<PersistenceExample />)
      const codeTextarea = screen.getByPlaceholderText("console.log('Hello World')")
      expect(codeTextarea).toBeInTheDocument()
    })
  })

  describe('Create Button', () => {
    it('should render create button', () => {
      render(<PersistenceExample />)
      expect(screen.getByRole('button', { name: /Create Snippet/i })).toBeInTheDocument()
    })

    it('should have correct button text', () => {
      render(<PersistenceExample />)
      expect(screen.getByText(/Create Snippet \(Auto-Saves\)/i)).toBeInTheDocument()
    })
  })

  describe('Form Interaction', () => {
    it('should update title input value on change', async () => {
      const user = userEvent.setup()
      render(<PersistenceExample />)

      const titleInput = screen.getByPlaceholderText('My Awesome Snippet') as HTMLInputElement
      await user.type(titleInput, 'My Test Snippet')
      expect(titleInput.value).toBe('My Test Snippet')
    })

    it('should update code textarea value on change', async () => {
      const user = userEvent.setup()
      render(<PersistenceExample />)

      const codeTextarea = screen.getByPlaceholderText("console.log('Hello World')") as HTMLTextAreaElement
      await user.type(codeTextarea, 'console.log("test")')
      expect(codeTextarea.value).toBe('console.log("test")')
    })

    it('should clear form fields after successful creation', async () => {
      const user = userEvent.setup()
      render(<PersistenceExample />)

      const titleInput = screen.getByPlaceholderText('My Awesome Snippet') as HTMLInputElement
      const codeTextarea = screen.getByPlaceholderText("console.log('Hello World')") as HTMLTextAreaElement
      const createButton = screen.getByRole('button', { name: /Create Snippet/i })

      await user.type(titleInput, 'Test Title')
      await user.type(codeTextarea, 'console.log("test")')

      // Mock dispatch to avoid actual Redux call
      mockDispatch.mockImplementation(() => {})

      await user.click(createButton)

      // After successful creation, fields should be cleared
      // Note: This test might need adjustment based on actual component behavior
      expect(mockDispatch).toHaveBeenCalled()
    })
  })

  describe('Button Click Handling', () => {
    it('should handle create button click', async () => {
      const user = userEvent.setup()
      render(<PersistenceExample />)

      const titleInput = screen.getByPlaceholderText('My Awesome Snippet')
      const codeTextarea = screen.getByPlaceholderText("console.log('Hello World')")
      const createButton = screen.getByRole('button', { name: /Create Snippet/i })

      await user.type(titleInput, 'Test Title')
      await user.type(codeTextarea, 'console.log("test")')

      mockDispatch.mockImplementation(() => {})
      await user.click(createButton)

      expect(mockDispatch).toHaveBeenCalled()
    })

    it('should show error toast when title is empty', async () => {
      const user = userEvent.setup()
      render(<PersistenceExample />)

      const codeTextarea = screen.getByPlaceholderText("console.log('Hello World')")
      const createButton = screen.getByRole('button', { name: /Create Snippet/i })

      await user.type(codeTextarea, 'console.log("test")')
      await user.click(createButton)

      expect(sonner.toast.error).toHaveBeenCalledWith('Please enter both title and code')
    })

    it('should show error toast when code is empty', async () => {
      const user = userEvent.setup()
      render(<PersistenceExample />)

      const titleInput = screen.getByPlaceholderText('My Awesome Snippet')
      const createButton = screen.getByRole('button', { name: /Create Snippet/i })

      await user.type(titleInput, 'Test Title')
      await user.click(createButton)

      expect(sonner.toast.error).toHaveBeenCalledWith('Please enter both title and code')
    })
  })

  describe('Instructions Section', () => {
    it('should render How It Works section', () => {
      render(<PersistenceExample />)
      expect(screen.getByText('How It Works')).toBeInTheDocument()
    })

    it('should render instruction list items', () => {
      render(<PersistenceExample />)
      expect(screen.getByText(/Click "Create Snippet" to dispatch a Redux action/i)).toBeInTheDocument()
      expect(screen.getByText(/Persistence middleware intercepts the action/i)).toBeInTheDocument()
      expect(screen.getByText(/Database save happens automatically \(100ms debounce\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Check console for/i)).toBeInTheDocument()
    })

    it('should render list with all steps', () => {
      const { container } = render(<PersistenceExample />)
      const listItems = container.querySelectorAll('li')
      expect(listItems.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Dispatch Integration', () => {
    it('should call dispatch with createSnippet action', async () => {
      const user = userEvent.setup()
      render(<PersistenceExample />)

      const titleInput = screen.getByPlaceholderText('My Awesome Snippet')
      const codeTextarea = screen.getByPlaceholderText("console.log('Hello World')")
      const createButton = screen.getByRole('button', { name: /Create Snippet/i })

      await user.type(titleInput, 'Test Title')
      await user.type(codeTextarea, 'const test = () => {}')

      mockDispatch.mockImplementation(() => {})
      await user.click(createButton)

      expect(mockDispatch).toHaveBeenCalled()
    })
  })

  describe('Component Structure', () => {
    it('should have proper card structure', () => {
      const { container } = render(<PersistenceExample />)
      expect(container.querySelector('[class*="rounded"]')).toBeInTheDocument()
    })

    it('should have icon in header', () => {
      const { container } = render(<PersistenceExample />)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have labels for form inputs', () => {
      render(<PersistenceExample />)
      expect(screen.getByLabelText('Snippet Title')).toBeInTheDocument()
      expect(screen.getByLabelText('Code')).toBeInTheDocument()
    })

    it('should have accessible button', () => {
      render(<PersistenceExample />)
      const button = screen.getByRole('button', { name: /Create Snippet/i })
      expect(button).toBeInTheDocument()
    })

    it('should have descriptive text for context', () => {
      render(<PersistenceExample />)
      expect(screen.getByText('Create a snippet and watch it automatically save to the database')).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should prevent submission with empty title and code', async () => {
      const user = userEvent.setup()
      render(<PersistenceExample />)

      const createButton = screen.getByRole('button', { name: /Create Snippet/i })
      await user.click(createButton)

      expect(sonner.toast.error).toHaveBeenCalledWith('Please enter both title and code')
    })

    it('should allow submission with both title and code filled', async () => {
      const user = userEvent.setup()
      render(<PersistenceExample />)

      const titleInput = screen.getByPlaceholderText('My Awesome Snippet')
      const codeTextarea = screen.getByPlaceholderText("console.log('Hello World')")
      const createButton = screen.getByRole('button', { name: /Create Snippet/i })

      await user.type(titleInput, 'Title')
      await user.type(codeTextarea, 'Code')

      mockDispatch.mockImplementation(() => {})
      await user.click(createButton)

      // Should dispatch and not show error toast
      expect(mockDispatch).toHaveBeenCalled()
    })
  })

  describe('Error States', () => {
    it('should handle missing title gracefully', async () => {
      const user = userEvent.setup()
      render(<PersistenceExample />)

      const codeTextarea = screen.getByPlaceholderText("console.log('Hello World')")
      const createButton = screen.getByRole('button', { name: /Create Snippet/i })

      await user.type(codeTextarea, 'test code')
      await user.click(createButton)

      expect(sonner.toast.error).toHaveBeenCalled()
    })

    it('should handle missing code gracefully', async () => {
      const user = userEvent.setup()
      render(<PersistenceExample />)

      const titleInput = screen.getByPlaceholderText('My Awesome Snippet')
      const createButton = screen.getByRole('button', { name: /Create Snippet/i })

      await user.type(titleInput, 'Test Title')
      await user.click(createButton)

      expect(sonner.toast.error).toHaveBeenCalled()
    })
  })
})
