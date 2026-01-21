import React from 'react'
import { render, screen, waitFor } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './tooltip'

describe('Tooltip Component', () => {
  describe('Rendering', () => {
    it('renders tooltip provider wrapper', () => {
      render(
        <TooltipProvider>
          <div data-testid="child">Test Content</div>
        </TooltipProvider>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('renders trigger element when wrapped in Tooltip', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Hover me</button>
            </TooltipTrigger>
            <TooltipContent>Tooltip text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument()
    })

    it('renders tooltip trigger and content structure', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Trigger</button>
            </TooltipTrigger>
            <TooltipContent>Tooltip content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      // Trigger should be rendered (content renders when open)
      expect(screen.getByRole('button', { name: 'Trigger' })).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('handles tooltip trigger click', async () => {
      const user = userEvent.setup()

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Show Tooltip</button>
            </TooltipTrigger>
            <TooltipContent>Content displayed</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      const trigger = screen.getByRole('button', { name: 'Show Tooltip' })
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.getByText('Content displayed')).toBeInTheDocument()
      })
    })

    it('shows tooltip on hover', async () => {
      const user = userEvent.setup()

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Hover trigger</button>
            </TooltipTrigger>
            <TooltipContent>Hover content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      const trigger = screen.getByRole('button', { name: 'Hover trigger' })
      await user.hover(trigger)

      await waitFor(() => {
        expect(screen.getByText('Hover content')).toBeInTheDocument()
      })
    })

    it('hides tooltip on unhover', async () => {
      const user = userEvent.setup()

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Hover me</button>
            </TooltipTrigger>
            <TooltipContent>Tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      const trigger = screen.getByRole('button', { name: 'Hover me' })

      // Hover in
      await user.hover(trigger)
      await waitFor(() => {
        expect(screen.getByText('Tooltip')).toBeInTheDocument()
      })

      // Unhover
      await user.unhover(trigger)

      // Content should be removed or hidden
      await waitFor(
        () => {
          const tooltip = screen.queryByText('Tooltip')
          // Depending on implementation, it might be removed or hidden
          if (tooltip) {
            expect(tooltip.closest('[role="tooltip"]')).toHaveStyle({ visibility: 'hidden' })
          }
        },
        { timeout: 500 }
      )
    })
  })

  describe('Accessibility', () => {
    it('has tooltip role on content when displayed', async () => {
      const user = userEvent.setup()
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Info</button>
            </TooltipTrigger>
            <TooltipContent role="tooltip">Helper text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      const trigger = screen.getByRole('button', { name: 'Info' })
      await user.hover(trigger)

      await waitFor(() => {
        const tooltip = screen.getByRole('tooltip')
        expect(tooltip).toBeInTheDocument()
      }, { timeout: 800 })
    })

    it('trigger is keyboard focusable', async () => {
      const user = userEvent.setup()

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Focus me</button>
            </TooltipTrigger>
            <TooltipContent>Info</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      const trigger = screen.getByRole('button', { name: 'Focus me' })
      await user.tab()

      expect(trigger).toHaveFocus()
    })

    it('supports aria-label on trigger', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button aria-label="Information button">?</button>
            </TooltipTrigger>
            <TooltipContent>More information</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      const trigger = screen.getByLabelText('Information button')
      expect(trigger).toBeInTheDocument()
    })
  })

  describe('Styling & Classes', () => {
    it('applies custom className to trigger', () => {
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="custom-trigger">Styled</button>
            </TooltipTrigger>
            <TooltipContent>Content</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      const trigger = screen.getByRole('button', { name: 'Styled' })
      expect(trigger).toHaveClass('custom-trigger')
    })

    it('applies custom className to content', async () => {
      const user = userEvent.setup()
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Show</button>
            </TooltipTrigger>
            <TooltipContent className="custom-content">Custom styled</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      const trigger = screen.getByRole('button', { name: 'Show' })
      await user.hover(trigger)

      await waitFor(() => {
        // The custom class is applied to the wrapper, not the text node
        const contentWrapper = screen.getByRole('tooltip')
        expect(contentWrapper).toHaveClass('custom-content')
      }, { timeout: 800 })
    })
  })

  describe('Multiple Tooltips', () => {
    it('renders multiple tooltips independently', async () => {
      const user = userEvent.setup()

      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>First</button>
            </TooltipTrigger>
            <TooltipContent>First tooltip</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button>Second</button>
            </TooltipTrigger>
            <TooltipContent>Second tooltip</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      const firstTrigger = screen.getByRole('button', { name: 'First' })
      const secondTrigger = screen.getByRole('button', { name: 'Second' })

      await user.hover(firstTrigger)
      await waitFor(() => {
        expect(screen.getByText('First tooltip')).toBeInTheDocument()
      })

      await user.unhover(firstTrigger)
      await user.hover(secondTrigger)

      await waitFor(() => {
        expect(screen.getByText('Second tooltip')).toBeInTheDocument()
      })
    })
  })

  describe('Content Variations', () => {
    it('supports text content when opened', async () => {
      const user = userEvent.setup()
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Info</button>
            </TooltipTrigger>
            <TooltipContent>Simple text</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      const trigger = screen.getByRole('button', { name: 'Info' })
      await user.hover(trigger)

      await waitFor(() => {
        expect(screen.getByText('Simple text')).toBeInTheDocument()
      }, { timeout: 800 })
    })

    it('supports React node content when opened', async () => {
      const user = userEvent.setup()
      render(
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Help</button>
            </TooltipTrigger>
            <TooltipContent>
              <div>
                <strong>Title</strong>
                <p>Description</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      const trigger = screen.getByRole('button', { name: 'Help' })
      await user.hover(trigger)

      await waitFor(() => {
        expect(screen.getByText('Title')).toBeInTheDocument()
        expect(screen.getByText('Description')).toBeInTheDocument()
      }, { timeout: 800 })
    })
  })

  describe('Delay Configuration', () => {
    it.skip('respects custom delay duration on provider', async () => {
      const user = userEvent.setup()

      render(
        <TooltipProvider delayDuration={500}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button>Delayed</button>
            </TooltipTrigger>
            <TooltipContent>Appears after delay</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )

      const trigger = screen.getByRole('button', { name: 'Delayed' })
      await user.hover(trigger)

      // Content should not appear immediately
      expect(screen.queryByText('Appears after delay')).not.toBeInTheDocument()

      // Wait for delay and verify content appears
      await waitFor(
        () => {
          expect(screen.getByText('Appears after delay')).toBeInTheDocument()
        },
        { timeout: 600 }
      )
    })
  })
})
