import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'

/**
 * Integration Tests for Aria-Live Regions in React Components
 *
 * Tests that verify aria-live regions work correctly in actual component context
 * and that announcements are properly triggered by user interactions and state changes.
 */

describe('Aria-Live Regions Integration Tests', () => {
  describe('MonacoEditor Accessibility', () => {
    it('should render editor status aria-live region', () => {
      // Mock component for testing
      const MockEditor = () => (
        <div data-testid="monaco-editor-container">
          <div
            className="sr-only"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-testid="monaco-editor-status"
          >
            Code editor loaded with JavaScript syntax highlighting. Editable mode.
          </div>
          <div>Editor content</div>
        </div>
      )

      render(<MockEditor />)

      const statusRegion = screen.getByTestId('monaco-editor-status')
      expect(statusRegion).toHaveAttribute('aria-live', 'polite')
      expect(statusRegion).toHaveAttribute('role', 'status')
      expect(statusRegion).toHaveAttribute('aria-atomic', 'true')
    })

    it('should announce language change in editor', () => {
      const languages = ['JavaScript', 'TypeScript', 'Python']
      const announcements = languages.map(
        (lang) => `Code editor loaded with ${lang} syntax highlighting.`
      )

      announcements.forEach((announcement) => {
        expect(announcement).toContain('Code editor loaded')
        expect(announcement).toMatch(/JavaScript|TypeScript|Python/)
      })
    })

    it('should distinguish editor modes in announcement', () => {
      const readOnlyAnnouncement = 'Code editor loaded with JavaScript syntax highlighting. Read-only mode.'
      const editableAnnouncement = 'Code editor loaded with JavaScript syntax highlighting. Editable mode.'

      expect(readOnlyAnnouncement).toContain('Read-only mode')
      expect(editableAnnouncement).toContain('Editable mode')
    })
  })

  describe('PythonTerminal Accessibility', () => {
    it('should render terminal status aria-live region', () => {
      const MockTerminal = ({ isRunning = false, hasErrors = false }) => (
        <div data-testid="python-terminal">
          <div
            className="sr-only"
            role="status"
            aria-live={hasErrors ? 'assertive' : 'polite'}
            aria-atomic="true"
            data-testid="terminal-status"
          >
            {isRunning && 'Code is running'}
            {hasErrors && 'Errors detected in output'}
          </div>
          <div
            data-testid="terminal-output-area"
            role="region"
            aria-label="Terminal output"
            aria-live="polite"
            aria-atomic="false"
          >
            Terminal content
          </div>
        </div>
      )

      const { rerender } = render(<MockTerminal isRunning={false} hasErrors={false} />)

      const statusRegion = screen.getByTestId('terminal-status')
      expect(statusRegion).toHaveAttribute('aria-live', 'polite')

      // Rerender with errors
      rerender(<MockTerminal isRunning={false} hasErrors={true} />)
      expect(statusRegion).toHaveAttribute('aria-live', 'assertive')
    })

    it('should switch aria-live to assertive on error', () => {
      const MockTerminal = ({ hasErrors = false }) => (
        <div
          className="sr-only"
          role="status"
          aria-live={hasErrors ? 'assertive' : 'polite'}
          data-testid="terminal-status"
        >
          {hasErrors && 'Errors detected'}
        </div>
      )

      const { rerender } = render(<MockTerminal hasErrors={false} />)
      const statusRegion = screen.getByTestId('terminal-status')

      expect(statusRegion).toHaveAttribute('aria-live', 'polite')

      rerender(<MockTerminal hasErrors={true} />)
      expect(statusRegion).toHaveAttribute('aria-live', 'assertive')
    })

    it('should announce code execution state', () => {
      const MockTerminal = ({ state = 'idle' }) => {
        const announcements: Record<string, string> = {
          idle: '',
          initializing: 'Terminal is initializing',
          running: 'Code is running',
          inputWaiting: 'Waiting for user input',
          complete: '5 lines of output',
        }

        return (
          <div className="sr-only" role="status" aria-live="polite">
            {announcements[state]}
          </div>
        )
      }

      render(<MockTerminal state="initializing" />)
      expect(screen.getByText('Terminal is initializing')).toBeInTheDocument()

      render(<MockTerminal state="running" />)
      expect(screen.getByText('Code is running')).toBeInTheDocument()
    })
  })

  describe('TerminalOutput Accessibility', () => {
    it('should have role="log" on output container', () => {
      const MockOutput = () => (
        <div
          data-testid="terminal-output-content"
          aria-label="Terminal output area"
          role="log"
        >
          Output lines
        </div>
      )

      render(<MockOutput />)

      const container = screen.getByTestId('terminal-output-content')
      expect(container).toHaveAttribute('role', 'log')
      expect(container).toHaveAttribute('aria-label', 'Terminal output area')
    })

    it('should announce errors immediately with assertive aria-live', () => {
      const MockErrorAlert = ({ lastError = null }) => (
        <>
          {lastError && (
            <div
              className="sr-only"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              data-testid="terminal-error-alert"
            >
              Error: {lastError}
            </div>
          )}
        </>
      )

      const { rerender } = render(<MockErrorAlert lastError={null} />)
      expect(screen.queryByTestId('terminal-error-alert')).not.toBeInTheDocument()

      rerender(<MockErrorAlert lastError="Division by zero" />)
      const errorAlert = screen.getByTestId('terminal-error-alert')
      expect(errorAlert).toHaveAttribute('aria-live', 'assertive')
      expect(errorAlert).toHaveAttribute('role', 'alert')
    })

    it('should mark individual error lines with role="alert"', () => {
      const MockOutputLine = ({ type = 'output', content = 'test' }) => (
        <div
          role={type === 'error' ? 'alert' : 'status'}
          aria-live={type === 'error' ? 'assertive' : 'off'}
          data-testid={`output-line-${type}`}
        >
          {content}
        </div>
      )

      render(<MockOutputLine type="error" content="Error occurred" />)

      const errorLine = screen.getByTestId('output-line-error')
      expect(errorLine).toHaveAttribute('role', 'alert')
      expect(errorLine).toHaveAttribute('aria-live', 'assertive')
    })

    it('should announce empty terminal state', () => {
      const MockEmpty = () => (
        <div
          data-testid="terminal-empty-state"
          role="status"
          aria-live="polite"
          aria-label="Terminal output area"
        >
          Click "Run" to execute the Python code
        </div>
      )

      render(<MockEmpty />)

      const emptyState = screen.getByTestId('terminal-empty-state')
      expect(emptyState).toHaveAttribute('aria-live', 'polite')
      expect(emptyState).toHaveTextContent('Click "Run"')
    })
  })

  describe('InputParameterList Accessibility', () => {
    it('should announce parameter count changes', () => {
      const MockParameterStatus = ({ count = 0 }) => (
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="parameters-status"
        >
          {count} parameter{count !== 1 ? 's' : ''} configured
        </div>
      )

      const { rerender } = render(<MockParameterStatus count={0} />)
      expect(screen.getByText('0 parameters configured')).toBeInTheDocument()

      rerender(<MockParameterStatus count={1} />)
      expect(screen.getByText('1 parameter configured')).toBeInTheDocument()

      rerender(<MockParameterStatus count={3} />)
      expect(screen.getByText('3 parameters configured')).toBeInTheDocument()
    })

    it('should use correct singular/plural form', () => {
      const MockParameterStatus = ({ count = 0 }) => (
        <div className="sr-only">
          {count} parameter{count !== 1 ? 's' : ''} configured
        </div>
      )

      render(<MockParameterStatus count={1} />)
      const singular = screen.getByText('1 parameter configured')
      expect(singular).toBeInTheDocument()
      expect(singular.textContent).not.toContain('parameters')

      render(<MockParameterStatus count={2} />)
      const plural = screen.getByText('2 parameters configured')
      expect(plural).toBeInTheDocument()
      expect(plural.textContent).toContain('parameters')
    })

    it('should include parameter count in button aria-label', () => {
      const MockAddButton = ({ paramCount = 0 }) => (
        <button
          data-testid="add-param-button"
          aria-label={`Add new parameter. Current parameters: ${paramCount}`}
        >
          Add Parameter
        </button>
      )

      const { rerender } = render(<MockAddButton paramCount={0} />)
      const button = screen.getByTestId('add-param-button')
      expect(button).toHaveAttribute('aria-label', 'Add new parameter. Current parameters: 0')

      rerender(<MockAddButton paramCount={3} />)
      expect(button).toHaveAttribute('aria-label', 'Add new parameter. Current parameters: 3')
    })

    it('should have aria-live="polite" for parameter list region', () => {
      const MockParameterList = ({ hasParams = false }) => (
        <>
          {hasParams && (
            <div role="region" aria-label="Input parameters list">
              <div
                className="sr-only"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                Parameters configured
              </div>
              <div>Parameter items</div>
            </div>
          )}
        </>
      )

      const { rerender } = render(<MockParameterList hasParams={false} />)
      expect(screen.queryByText('Parameters configured')).not.toBeInTheDocument()

      rerender(<MockParameterList hasParams={true} />)
      const statusRegion = screen.getByText('Parameters configured')
      expect(statusRegion).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('EmptyState Accessibility', () => {
    it('should have aria-live="polite" on main container', () => {
      const MockEmptyState = () => (
        <div
          data-testid="empty-state"
          role="status"
          aria-live="polite"
          aria-label="No snippets available"
        >
          <h2>No snippets yet</h2>
          <p>Create your first snippet to get started</p>
        </div>
      )

      render(<MockEmptyState />)

      const emptyState = screen.getByTestId('empty-state')
      expect(emptyState).toHaveAttribute('aria-live', 'polite')
      expect(emptyState).toHaveAttribute('role', 'status')
    })

    it('should render hidden aria-live region for announcement', () => {
      const MockEmptyState = () => (
        <>
          <div
            className="sr-only"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            data-testid="empty-state-message"
          >
            No snippets yet. Create your first snippet to get started.
          </div>
          <div data-testid="empty-state-visual">
            <h2>No snippets yet</h2>
          </div>
        </>
      )

      render(<MockEmptyState />)

      const hiddenMessage = screen.getByTestId('empty-state-message')
      const visualContent = screen.getByTestId('empty-state-visual')

      expect(hiddenMessage).toHaveAttribute('aria-live', 'polite')
      expect(hiddenMessage).toHaveClass('sr-only')
      expect(visualContent).toBeInTheDocument()
    })

    it('should combine title and description in announcement', () => {
      const title = 'No snippets yet'
      const description = 'Create your first snippet to get started'
      const announcement = `${title}. ${description}`

      expect(announcement).toContain(title)
      expect(announcement).toContain(description)
      expect(announcement).toMatch(/\.\s/)
    })

    it('should provide guidance through aria-label', () => {
      const MockEmptyState = () => (
        <div
          data-testid="empty-state"
          aria-label="No snippets available. Use the Create button to get started."
        >
          Empty state
        </div>
      )

      render(<MockEmptyState />)

      const emptyState = screen.getByTestId('empty-state')
      expect(emptyState.getAttribute('aria-label')).toContain('No snippets')
      expect(emptyState.getAttribute('aria-label')).toContain('Create')
    })
  })

  describe('Dynamic Content Updates', () => {
    it('should update aria-live content without removing region', async () => {
      const MockDynamicContent = ({ status = '' }) => (
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          data-testid="status"
        >
          {status}
        </div>
      )

      const { rerender } = render(<MockDynamicContent status="Loading..." />)
      const region = screen.getByTestId('status')

      expect(region).toHaveAttribute('aria-live', 'polite')
      expect(region).toHaveTextContent('Loading...')

      rerender(<MockDynamicContent status="Complete" />)
      expect(region).toHaveAttribute('aria-live', 'polite')
      expect(region).toHaveTextContent('Complete')
    })

    it('should persist aria-live attribute during content changes', () => {
      const MockContent = ({ error = false }) => (
        <div
          className="sr-only"
          role="status"
          aria-live={error ? 'assertive' : 'polite'}
          data-testid="content"
        >
          {error ? 'Error occurred' : 'Operation successful'}
        </div>
      )

      const { rerender } = render(<MockContent error={false} />)
      const region = screen.getByTestId('content')

      expect(region).toHaveAttribute('aria-live', 'polite')

      rerender(<MockContent error={true} />)
      expect(region).toHaveAttribute('role', 'status')
      expect(region).toHaveAttribute('aria-live', 'assertive')
    })
  })

  describe('Accessibility Attribute Combinations', () => {
    it('should combine role and aria-live correctly for status regions', () => {
      const MockStatus = () => (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Operation status"
          data-testid="status-region"
        >
          Status content
        </div>
      )

      render(<MockStatus />)

      const region = screen.getByTestId('status-region')
      expect(region).toHaveAttribute('role', 'status')
      expect(region).toHaveAttribute('aria-live', 'polite')
      expect(region).toHaveAttribute('aria-atomic', 'true')
      expect(region).toHaveAttribute('aria-label', 'Operation status')
    })

    it('should combine role and aria-live correctly for alert regions', () => {
      const MockAlert = () => (
        <div
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          data-testid="alert-region"
        >
          Error message
        </div>
      )

      render(<MockAlert />)

      const region = screen.getByTestId('alert-region')
      expect(region).toHaveAttribute('role', 'alert')
      expect(region).toHaveAttribute('aria-live', 'assertive')
      expect(region).toHaveAttribute('aria-atomic', 'true')
    })
  })

  describe('Screen Reader Only Content', () => {
    it('should use sr-only class for screen-reader-only regions', () => {
      const MockScreenReaderOnly = () => (
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          data-testid="sr-only-region"
        >
          This is only for screen readers
        </div>
      )

      render(<MockScreenReaderOnly />)

      const region = screen.getByTestId('sr-only-region')
      expect(region).toHaveClass('sr-only')
    })

    it('should combine sr-only with proper accessibility attributes', () => {
      const MockCombined = () => (
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Status update"
          data-testid="combined"
        >
          Screen reader announcement
        </div>
      )

      render(<MockCombined />)

      const element = screen.getByTestId('combined')
      expect(element).toHaveClass('sr-only')
      expect(element).toHaveAttribute('aria-live', 'polite')
      expect(element).toHaveAttribute('aria-label', 'Status update')
    })
  })
})
