import React from 'react'
import { render, screen } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { AIErrorHelper } from './AIErrorHelper'

// Mock child components
jest.mock('./LoadingAnalysis', () => ({
  LoadingAnalysis: () => <div data-testid="loading-analysis">Analyzing...</div>,
}))

jest.mock('./MarkdownRenderer', () => ({
  MarkdownRenderer: ({ content }: any) => (
    <div data-testid="markdown-renderer">{content}</div>
  ),
}))

// Mock analyzeErrorWithAI
jest.mock('./analyzeError', () => ({
  analyzeErrorWithAI: jest.fn(),
}))

import { analyzeErrorWithAI } from './analyzeError'

describe('AIErrorHelper Component', () => {
  const mockAnalyzeError = analyzeErrorWithAI as jest.MockedFunction<
    typeof analyzeErrorWithAI
  >

  const testError = new Error('Test error message')

  beforeEach(() => {
    jest.clearAllMocks()
    mockAnalyzeError.mockResolvedValue('## Error Analysis\n\nTest analysis result')
  })

  describe('Rendering', () => {
    it('renders button to trigger AI analysis', () => {
      render(<AIErrorHelper error={testError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      expect(button).toBeInTheDocument()
    })

    it('renders button with correct text', () => {
      render(<AIErrorHelper error={testError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      expect(button).toHaveTextContent('Ask AI for Help')
    })

    it('applies custom className', () => {
      const { container } = render(
        <AIErrorHelper error={testError} className="custom-class" />
      )

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })

    it('button has outline variant styling', () => {
      render(<AIErrorHelper error={testError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      expect(button).toHaveClass('border-accent/50')
    })

    it('button is keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<AIErrorHelper error={testError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      button.focus()
      expect(button).toHaveFocus()
    })
  })

  describe('Error Analysis', () => {
    it('calls analyzeErrorWithAI with error message', async () => {
      const user = userEvent.setup()
      render(<AIErrorHelper error={testError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      await user.click(button)

      expect(mockAnalyzeError).toHaveBeenCalled()
    })

    it('passes error message to analyzeErrorWithAI', async () => {
      const user = userEvent.setup()
      const customError = new Error('Custom error')
      render(<AIErrorHelper error={customError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      await user.click(button)

      expect(mockAnalyzeError).toHaveBeenCalledWith('Custom error', expect.any(String), undefined)
    })

    it('handles string error input', async () => {
      const user = userEvent.setup()
      const stringError = 'This is a string error'

      render(<AIErrorHelper error={stringError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      await user.click(button)

      expect(mockAnalyzeError).toHaveBeenCalledWith(stringError, '', undefined)
    })

    it('passes context when provided', async () => {
      const user = userEvent.setup()
      const context = 'User was editing a snippet'

      render(<AIErrorHelper error={testError} context={context} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      await user.click(button)

      expect(mockAnalyzeError).toHaveBeenCalledWith(
        'Test error message',
        expect.any(String),
        context
      )
    })
  })

  describe('Analysis State', () => {
    it('button is clickable and responds to clicks', async () => {
      const user = userEvent.setup()
      render(<AIErrorHelper error={testError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })

      expect(button).toBeInTheDocument()
      await user.click(button)
      expect(mockAnalyzeError).toHaveBeenCalled()
    })

    it('handles multiple clicks', async () => {
      const user = userEvent.setup()
      render(<AIErrorHelper error={testError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })

      await user.click(button)
      expect(mockAnalyzeError).toHaveBeenCalledTimes(1)

      mockAnalyzeError.mockClear()
      await user.click(button)
      expect(mockAnalyzeError).toHaveBeenCalledTimes(1)
    })
  })

  describe('Error Handling', () => {
    it('handles rejected promises gracefully', async () => {
      const user = userEvent.setup()
      mockAnalyzeError.mockRejectedValueOnce(new Error('API error'))

      render(<AIErrorHelper error={testError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      await user.click(button)

      expect(mockAnalyzeError).toHaveBeenCalled()
    })

    it('handles network errors', async () => {
      const user = userEvent.setup()
      mockAnalyzeError.mockRejectedValueOnce(new Error('Network timeout'))

      render(<AIErrorHelper error={testError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      await user.click(button)

      expect(mockAnalyzeError).toHaveBeenCalled()
    })
  })

  describe('Parameter Handling', () => {
    it('handles error without stack trace', async () => {
      const user = userEvent.setup()
      const errorNoStack = new Error('Error without stack')
      errorNoStack.stack = undefined

      render(<AIErrorHelper error={errorNoStack} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      await user.click(button)

      expect(mockAnalyzeError).toHaveBeenCalled()
    })

    it('handles very long error messages', async () => {
      const user = userEvent.setup()
      const longMessage = 'A'.repeat(1000)
      const longError = new Error(longMessage)

      render(<AIErrorHelper error={longError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      await user.click(button)

      expect(mockAnalyzeError).toHaveBeenCalled()
    })

    it('handles special characters in error message', async () => {
      const user = userEvent.setup()
      const specialError = new Error('<>&"\'`')

      render(<AIErrorHelper error={specialError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      await user.click(button)

      expect(mockAnalyzeError).toHaveBeenCalled()
    })

    it('handles empty error message', async () => {
      const user = userEvent.setup()
      const emptyError = new Error('')

      render(<AIErrorHelper error={emptyError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      await user.click(button)

      expect(mockAnalyzeError).toHaveBeenCalledWith('', expect.any(String), undefined)
    })
  })

  describe('Accessibility', () => {
    it('button has accessible text', () => {
      render(<AIErrorHelper error={testError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Ask AI for Help')
    })

    it('button is focusable', async () => {
      render(<AIErrorHelper error={testError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      button.focus()
      expect(button).toHaveFocus()
    })

    it('button responds to keyboard events', async () => {
      const user = userEvent.setup()
      render(<AIErrorHelper error={testError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      button.focus()

      await user.keyboard('{Enter}')

      expect(mockAnalyzeError).toHaveBeenCalled()
    })
  })

  describe('Integration Tests', () => {
    it('complete workflow: click and analyze', async () => {
      const user = userEvent.setup()
      mockAnalyzeError.mockResolvedValue('## Error Found\n\nThis is the issue')

      render(<AIErrorHelper error={testError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      await user.click(button)

      expect(mockAnalyzeError).toHaveBeenCalledWith(
        'Test error message',
        expect.any(String),
        undefined
      )
    })

    it('complete workflow: with context', async () => {
      const user = userEvent.setup()
      const context = 'During snippet save'

      render(<AIErrorHelper error={testError} context={context} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      await user.click(button)

      expect(mockAnalyzeError).toHaveBeenCalledWith(
        'Test error message',
        expect.any(String),
        context
      )
    })

    it('complete workflow: with stack trace', async () => {
      const user = userEvent.setup()
      const errorWithStack = new Error('Error')
      errorWithStack.stack = 'at foo.js:10'

      render(<AIErrorHelper error={errorWithStack} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      await user.click(button)

      const callArgs = mockAnalyzeError.mock.calls[0]
      expect(callArgs[1]).toContain('at foo.js:10')
    })

    it('renders and functions without errors', () => {
      expect(() => {
        render(<AIErrorHelper error={testError} />)
      }).not.toThrow()
    })

    it('renders multiple instances independently', () => {
      const { container } = render(
        <div>
          <AIErrorHelper error={new Error('Error 1')} />
          <AIErrorHelper error={new Error('Error 2')} />
        </div>
      )

      const buttons = screen.getAllByRole('button', { name: /ask ai for help/i })
      expect(buttons).toHaveLength(2)
    })
  })

  describe('Props Handling', () => {
    it('handles all props correctly', () => {
      render(
        <AIErrorHelper
          error={testError}
          context="Test context"
          className="test-class"
        />
      )

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      expect(button).toBeInTheDocument()
    })

    it('renders with undefined context', () => {
      render(<AIErrorHelper error={testError} context={undefined} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      expect(button).toBeInTheDocument()
    })

    it('renders with undefined className', () => {
      render(<AIErrorHelper error={testError} className={undefined} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Component Stability', () => {
    it('component rerenders without issues', () => {
      const { rerender } = render(<AIErrorHelper error={testError} />)

      rerender(<AIErrorHelper error={new Error('New error')} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      expect(button).toBeInTheDocument()
    })

    it('handles prop changes gracefully', () => {
      const { rerender } = render(
        <AIErrorHelper error={testError} context="Original context" />
      )

      rerender(
        <AIErrorHelper error={testError} context="Updated context" />
      )

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      expect(button).toBeInTheDocument()
    })

    it('maintains functionality after rerenders', async () => {
      const user = userEvent.setup()
      const { rerender } = render(<AIErrorHelper error={testError} />)

      rerender(<AIErrorHelper error={testError} />)

      const button = screen.getByRole('button', { name: /ask ai for help/i })
      await user.click(button)

      expect(mockAnalyzeError).toHaveBeenCalled()
    })
  })
})
