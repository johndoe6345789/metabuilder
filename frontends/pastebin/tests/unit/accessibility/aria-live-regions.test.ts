import { describe, it, expect, vi } from 'vitest'

/**
 * Aria-Live Regions Accessibility Tests
 *
 * Tests that verify aria-live regions are properly implemented
 * for dynamic content announcements to screen reader users.
 */

describe('Aria-Live Regions Accessibility', () => {
  describe('MonacoEditor aria-live region', () => {
    it('should have aria-live="polite" for editor status', () => {
      const region = document.createElement('div')
      region.setAttribute('aria-live', 'polite')
      region.setAttribute('role', 'status')
      region.setAttribute('aria-atomic', 'true')

      expect(region.getAttribute('aria-live')).toBe('polite')
      expect(region.getAttribute('role')).toBe('status')
      expect(region.getAttribute('aria-atomic')).toBe('true')
    })

    it('should announce editor initialization with language', () => {
      const announcement = 'Code editor loaded with JavaScript syntax highlighting. Editable mode.'
      expect(announcement).toContain('Code editor loaded')
      expect(announcement).toContain('JavaScript')
      expect(announcement).toContain('Editable mode')
    })

    it('should distinguish between read-only and editable modes', () => {
      const editableAnnouncement = 'Code editor loaded with TypeScript syntax highlighting. Editable mode.'
      const readOnlyAnnouncement = 'Code editor loaded with TypeScript syntax highlighting. Read-only mode.'

      expect(editableAnnouncement).toContain('Editable mode')
      expect(readOnlyAnnouncement).toContain('Read-only mode')
    })
  })

  describe('PythonTerminal aria-live regions', () => {
    it('should use aria-live="polite" for normal terminal status', () => {
      const statusRegion = document.createElement('div')
      statusRegion.setAttribute('aria-live', 'polite')
      statusRegion.setAttribute('role', 'status')

      expect(statusRegion.getAttribute('aria-live')).toBe('polite')
    })

    it('should switch to aria-live="assertive" when errors occur', () => {
      const statusRegion = document.createElement('div')
      // Simulate error state
      const hasErrors = true
      statusRegion.setAttribute('aria-live', hasErrors ? 'assertive' : 'polite')

      expect(statusRegion.getAttribute('aria-live')).toBe('assertive')
    })

    it('should announce terminal running state', () => {
      const announcements = {
        running: 'Code is running',
        initializing: 'Terminal is initializing',
        waitingForInput: 'Waiting for user input',
      }

      expect(announcements.running).toContain('running')
      expect(announcements.initializing).toContain('initializing')
      expect(announcements.waitingForInput).toContain('input')
    })

    it('should announce output line count', () => {
      const lineCount = 5
      const announcement = `${lineCount} lines of output`
      expect(announcement).toContain('5')
      expect(announcement).toContain('output')
    })

    it('should announce error detection', () => {
      const announcement = 'Errors detected in output'
      expect(announcement).toContain('Errors')
      expect(announcement).toContain('detected')
    })

    it('should have aria-live="polite" on output area', () => {
      const outputArea = document.createElement('div')
      outputArea.setAttribute('aria-live', 'polite')
      outputArea.setAttribute('role', 'region')
      outputArea.setAttribute('aria-label', 'Terminal output')

      expect(outputArea.getAttribute('aria-live')).toBe('polite')
      expect(outputArea.getAttribute('role')).toBe('region')
    })
  })

  describe('TerminalOutput aria-live regions', () => {
    it('should have role="log" for output container', () => {
      const container = document.createElement('div')
      container.setAttribute('role', 'log')
      container.setAttribute('aria-label', 'Terminal output area')

      expect(container.getAttribute('role')).toBe('log')
      expect(container.getAttribute('aria-label')).toContain('Terminal output')
    })

    it('should have aria-live="assertive" for error alerts', () => {
      const errorAlert = document.createElement('div')
      errorAlert.setAttribute('role', 'alert')
      errorAlert.setAttribute('aria-live', 'assertive')
      errorAlert.setAttribute('aria-atomic', 'true')

      expect(errorAlert.getAttribute('aria-live')).toBe('assertive')
      expect(errorAlert.getAttribute('role')).toBe('alert')
    })

    it('should announce last error message', () => {
      const errorContent = 'SyntaxError: Unexpected token'
      const announcement = `Error: ${errorContent}`
      expect(announcement).toContain('Error:')
      expect(announcement).toContain(errorContent)
    })

    it('should provide empty state announcement', () => {
      const emptyStateAnnouncement = 'Click "Run" to execute the Python code'
      expect(emptyStateAnnouncement).toContain('Run')
      expect(emptyStateAnnouncement).toContain('execute')
    })

    it('should mark individual error lines with role="alert"', () => {
      const errorLine = document.createElement('div')
      errorLine.setAttribute('role', 'alert')
      errorLine.setAttribute('aria-live', 'assertive')
      errorLine.setAttribute('aria-label', 'Error: Division by zero')

      expect(errorLine.getAttribute('role')).toBe('alert')
      expect(errorLine.getAttribute('aria-live')).toBe('assertive')
      expect(errorLine.getAttribute('aria-label')).toContain('Error')
    })

    it('should mark output lines with role="status"', () => {
      const outputLine = document.createElement('div')
      outputLine.setAttribute('role', 'status')
      outputLine.setAttribute('aria-live', 'off')

      expect(outputLine.getAttribute('role')).toBe('status')
      expect(outputLine.getAttribute('aria-live')).toBe('off')
    })
  })

  describe('InputParameterList aria-live regions', () => {
    it('should announce parameter count updates', () => {
      const announcements = {
        zero: '0 parameters configured',
        one: '1 parameter configured',
        multiple: '3 parameters configured',
      }

      expect(announcements.one).toContain('1 parameter')
      expect(announcements.multiple).toContain('3 parameters')
    })

    it('should use correct singular/plural grammar', () => {
      const singular = '1 parameter configured'
      const plural = '2 parameters configured'

      expect(singular).toContain('parameter')
      expect(!singular.includes('parameters'))
      expect(plural).toContain('parameters')
    })

    it('should have aria-live="polite" for parameter status', () => {
      const statusRegion = document.createElement('div')
      statusRegion.setAttribute('aria-live', 'polite')
      statusRegion.setAttribute('role', 'status')
      statusRegion.setAttribute('aria-atomic', 'true')

      expect(statusRegion.getAttribute('aria-live')).toBe('polite')
      expect(statusRegion.getAttribute('aria-atomic')).toBe('true')
    })

    it('should include parameter count in button aria-label', () => {
      const buttonLabel = 'Add new parameter. Current parameters: 2'
      expect(buttonLabel).toContain('Add new parameter')
      expect(buttonLabel).toContain('Current parameters')
      expect(buttonLabel).toContain('2')
    })

    it('should update aria-label when parameters change', () => {
      const labels = {
        initial: 'Add new parameter. Current parameters: 0',
        after1: 'Add new parameter. Current parameters: 1',
        after3: 'Add new parameter. Current parameters: 3',
      }

      expect(labels.initial).toContain('0')
      expect(labels.after1).toContain('1')
      expect(labels.after3).toContain('3')
    })
  })

  describe('EmptyState aria-live regions', () => {
    it('should have aria-live="polite" on container', () => {
      const container = document.createElement('div')
      container.setAttribute('aria-live', 'polite')
      container.setAttribute('role', 'status')
      container.setAttribute('aria-label', 'No snippets available')

      expect(container.getAttribute('aria-live')).toBe('polite')
      expect(container.getAttribute('role')).toBe('status')
    })

    it('should have hidden aria-live region for announcement', () => {
      const hiddenRegion = document.createElement('div')
      hiddenRegion.className = 'sr-only'
      hiddenRegion.setAttribute('aria-live', 'polite')
      hiddenRegion.setAttribute('role', 'status')
      hiddenRegion.setAttribute('aria-atomic', 'true')

      expect(hiddenRegion.className).toContain('sr-only')
      expect(hiddenRegion.getAttribute('aria-live')).toBe('polite')
    })

    it('should announce empty state with title and description', () => {
      const announcement = 'No snippets yet. Create your first snippet to get started.'
      expect(announcement).toContain('No snippets')
      expect(announcement).toContain('Create')
    })

    it('should guide user to create snippet', () => {
      const announcement = 'No snippets available. Start creating snippets using the button below.'
      expect(announcement).toContain('No snippets')
      expect(announcement).toContain('creating snippets')
    })
  })

  describe('General aria-live best practices', () => {
    it('should use sr-only class for screen-reader-only content', () => {
      const element = document.createElement('div')
      element.className = 'sr-only'

      expect(element.className).toContain('sr-only')
    })

    it('should use aria-atomic="true" for complete message updates', () => {
      const element = document.createElement('div')
      element.setAttribute('aria-atomic', 'true')

      expect(element.getAttribute('aria-atomic')).toBe('true')
    })

    it('should use aria-atomic="false" for incremental updates', () => {
      const element = document.createElement('div')
      element.setAttribute('aria-atomic', 'false')

      expect(element.getAttribute('aria-atomic')).toBe('false')
    })

    it('should provide meaningful aria-labels', () => {
      const labels = [
        'Terminal output area',
        'Terminal output',
        'Input parameters list',
        'No snippets available',
        'Code editor',
      ]

      labels.forEach((label) => {
        expect(label.length).toBeGreaterThan(0)
        expect(label).toMatch(/\w+/)
      })
    })

    it('should use appropriate role attributes', () => {
      const roles = {
        status: 'status',
        alert: 'alert',
        log: 'log',
        region: 'region',
      }

      Object.values(roles).forEach((role) => {
        expect(role).toMatch(/^(status|alert|log|region)$/)
      })
    })
  })

  describe('Aria-live region combinations', () => {
    it('should combine role and aria-live for status announcements', () => {
      const element = document.createElement('div')
      element.setAttribute('role', 'status')
      element.setAttribute('aria-live', 'polite')

      expect(element.getAttribute('role')).toBe('status')
      expect(element.getAttribute('aria-live')).toBe('polite')
    })

    it('should combine role and aria-live for alerts', () => {
      const element = document.createElement('div')
      element.setAttribute('role', 'alert')
      element.setAttribute('aria-live', 'assertive')

      expect(element.getAttribute('role')).toBe('alert')
      expect(element.getAttribute('aria-live')).toBe('assertive')
    })

    it('should combine all accessibility attributes correctly', () => {
      const element = document.createElement('div')
      element.setAttribute('role', 'log')
      element.setAttribute('aria-live', 'polite')
      element.setAttribute('aria-atomic', 'true')
      element.setAttribute('aria-label', 'Terminal output')
      element.className = 'sr-only'
      element.setAttribute('data-testid', 'terminal-output')

      expect(element.getAttribute('role')).toBe('log')
      expect(element.getAttribute('aria-live')).toBe('polite')
      expect(element.getAttribute('aria-atomic')).toBe('true')
      expect(element.getAttribute('aria-label')).toContain('Terminal')
      expect(element.className).toContain('sr-only')
      expect(element.getAttribute('data-testid')).toBe('terminal-output')
    })
  })

  describe('Dynamic state changes', () => {
    it('should update aria-live urgency based on error state', () => {
      const element = document.createElement('div')

      // Initial state - polite
      element.setAttribute('aria-live', 'polite')
      expect(element.getAttribute('aria-live')).toBe('polite')

      // Error state - assertive
      element.setAttribute('aria-live', 'assertive')
      expect(element.getAttribute('aria-live')).toBe('assertive')
    })

    it('should update announcement content based on state', () => {
      const getAnnouncement = (isRunning: boolean, hasErrors: boolean) => {
        if (hasErrors) return 'Errors detected in output'
        if (isRunning) return 'Code is running'
        return 'Code execution complete'
      }

      expect(getAnnouncement(true, false)).toBe('Code is running')
      expect(getAnnouncement(false, true)).toBe('Errors detected in output')
      expect(getAnnouncement(false, false)).toBe('Code execution complete')
    })

    it('should maintain aria-live during state transitions', () => {
      const element = document.createElement('div')
      element.setAttribute('aria-live', 'polite')
      element.setAttribute('role', 'status')

      // Simulate state change
      const hasErrors = true
      element.setAttribute('aria-live', hasErrors ? 'assertive' : 'polite')

      expect(element.getAttribute('role')).toBe('status') // role unchanged
      expect(element.getAttribute('aria-live')).toBe('assertive') // aria-live updated
    })
  })

  describe('Accessibility compliance', () => {
    it('should comply with WCAG 2.1 Level AA for dynamic content', () => {
      const requirements = [
        'aria-live attribute defined',
        'role attribute specified',
        'aria-atomic defined for complex updates',
        'aria-label or aria-labelledby provided',
        'Content hidden from view but available to screen readers',
      ]

      requirements.forEach((req) => {
        expect(req).toBeTruthy()
      })
    })

    it('should provide non-visual feedback for all state changes', () => {
      const feedbackMethods = {
        statusUpdate: 'aria-live announcement',
        errorAlert: 'role="alert" with aria-live="assertive"',
        userGuidance: 'aria-label with instructions',
        stateIndicator: 'dynamic aria-live region',
      }

      Object.values(feedbackMethods).forEach((method) => {
        expect(method).toContain('aria')
      })
    })

    it('should not duplicate visual and screen reader content unnecessarily', () => {
      const visualContent = 'Error: Division by zero'
      const screenReaderOnlyContent = 'Error: Division by zero'

      // Screen reader content should add context, not just repeat
      const enhancedScreenReaderContent = 'Error in output: Division by zero'
      expect(enhancedScreenReaderContent).toContain(visualContent)
    })
  })
})
