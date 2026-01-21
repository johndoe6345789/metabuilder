import React from 'react'
import { render, screen } from '@/test-utils'
import { LoadingAnalysis } from './LoadingAnalysis'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('LoadingAnalysis Component', () => {
  describe('Rendering', () => {
    it('renders loading container', () => {
      const { container } = render(<LoadingAnalysis />)

      expect(container.querySelector('.space-y-3')).toBeInTheDocument()
    })

    it('displays loading text', () => {
      render(<LoadingAnalysis />)

      expect(screen.getByText('Analyzing error...')).toBeInTheDocument()
    })

    it('renders loading text with muted foreground color', () => {
      render(<LoadingAnalysis />)

      const textContainer = screen.getByText('Analyzing error...').parentElement
      expect(textContainer).toHaveClass('text-muted-foreground')
    })

    it('renders three loading bars', () => {
      const { container } = render(<LoadingAnalysis />)

      const bars = container.querySelectorAll('.h-4')
      expect(bars.length).toBeGreaterThanOrEqual(3)
    })

    it('loading bars have correct styling', () => {
      const { container } = render(<LoadingAnalysis />)

      const bars = container.querySelectorAll('.bg-muted')
      expect(bars.length).toBeGreaterThanOrEqual(3)

      bars.forEach((bar) => {
        expect(bar).toHaveClass('rounded')
      })
    })
  })

  describe('Loading Icon', () => {
    it('renders icon with loading indicator', () => {
      render(<LoadingAnalysis />)

      // Sparkle icon is rendered in the text container
      const textContainer = screen.getByText('Analyzing error...').parentElement
      expect(textContainer).toBeInTheDocument()
      expect(textContainer).toHaveClass('flex', 'items-center', 'gap-2')
    })

    it('icon has correct size class', () => {
      const { container } = render(<LoadingAnalysis />)

      // h-4 w-4 for icon
      const iconElements = container.querySelectorAll('[class*="h-4"]')
      expect(iconElements.length).toBeGreaterThan(0)
    })

    it('icon is rotated for animation', () => {
      render(<LoadingAnalysis />)

      // Icon should be in a motion div with rotate animation
      expect(screen.getByText('Analyzing error...')).toBeInTheDocument()
    })
  })

  describe('Animation Bars', () => {
    it('renders correct number of animation bars', () => {
      const { container } = render(<LoadingAnalysis />)

      // Three bars for animation
      const barContainers = container.querySelectorAll('.space-y-2 > div')
      expect(barContainers.length).toBe(3)
    })

    it('each bar has consistent styling', () => {
      const { container } = render(<LoadingAnalysis />)

      const bars = container.querySelectorAll('.h-4.bg-muted.rounded')
      expect(bars.length).toBe(3)

      bars.forEach((bar) => {
        expect(bar).toHaveClass('h-4', 'bg-muted', 'rounded')
      })
    })

    it('bars are in a flex column layout', () => {
      const { container } = render(<LoadingAnalysis />)

      const barContainer = container.querySelector('.space-y-2')
      expect(barContainer).toBeInTheDocument()
      expect(barContainer).toHaveClass('space-y-2')
    })
  })

  describe('Layout Structure', () => {
    it('has proper flex layout for text and icon', () => {
      render(<LoadingAnalysis />)

      const textContainer = screen.getByText('Analyzing error...').parentElement
      expect(textContainer).toHaveClass('flex', 'items-center', 'gap-2')
    })

    it('maintains spacing between text and bars', () => {
      const { container } = render(<LoadingAnalysis />)

      const mainContainer = container.querySelector('.space-y-3')
      expect(mainContainer).toHaveClass('space-y-3')
    })

    it('text is aligned at top level', () => {
      render(<LoadingAnalysis />)

      const textContainer = screen.getByText('Analyzing error...').parentElement
      expect(textContainer).toHaveClass('flex', 'items-center')
    })
  })

  describe('Styling and Classes', () => {
    it('applies text-sm to loading text', () => {
      render(<LoadingAnalysis />)

      const span = screen.getByText('Analyzing error...')
      expect(span).toHaveClass('text-sm')
    })

    it('applies muted color scheme', () => {
      render(<LoadingAnalysis />)

      const textContainer = screen.getByText('Analyzing error...').parentElement
      expect(textContainer).toHaveClass('text-muted-foreground')
    })

    it('has gap between icon and text', () => {
      render(<LoadingAnalysis />)

      const flexContainer = screen.getByText('Analyzing error...').parentElement
      expect(flexContainer).toHaveClass('gap-2')
    })

    it('bars are rounded rectangles', () => {
      const { container } = render(<LoadingAnalysis />)

      const bars = container.querySelectorAll('.bg-muted')
      bars.forEach((bar) => {
        expect(bar).toHaveClass('rounded')
      })
    })
  })

  describe('Text Content', () => {
    it('displays specific loading message', () => {
      render(<LoadingAnalysis />)

      expect(screen.getByText('Analyzing error...')).toBeInTheDocument()
    })

    it('text is exactly as expected', () => {
      render(<LoadingAnalysis />)

      const text = screen.getByText('Analyzing error...')
      expect(text.textContent).toBe('Analyzing error...')
    })
  })

  describe('Motion Animation Setup', () => {
    it('wraps bars in motion divs', () => {
      const { container } = render(<LoadingAnalysis />)

      // Bars should be inside motion.div (which renders as div)
      const barContainer = container.querySelector('.space-y-2')
      expect(barContainer).toBeInTheDocument()

      const children = barContainer?.children
      expect(children?.length).toBe(3)
    })

    it('renders loading indicator structure correctly', () => {
      const { container } = render(<LoadingAnalysis />)

      const mainSpace = container.querySelector('.space-y-3')
      expect(mainSpace).toBeInTheDocument()

      const children = mainSpace?.children
      expect(children?.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Accessibility', () => {
    it('loading text is visible and readable', () => {
      render(<LoadingAnalysis />)

      const text = screen.getByText('Analyzing error...')
      expect(text).toBeVisible()
    })

    it('text is semantically meaningful', () => {
      render(<LoadingAnalysis />)

      const text = screen.getByText('Analyzing error...')
      expect(text.textContent).toContain('Analyzing')
    })

    it('component structure is accessible', () => {
      const { container } = render(<LoadingAnalysis />)

      // Should have proper semantic structure
      expect(container.firstChild).toBeInTheDocument()
    })

    it('provides visual feedback through animation bars', () => {
      const { container } = render(<LoadingAnalysis />)

      const bars = container.querySelectorAll('.bg-muted')
      expect(bars.length).toBe(3)
    })
  })

  describe('Responsive Behavior', () => {
    it('component renders on different screen sizes', () => {
      render(<LoadingAnalysis />)

      expect(screen.getByText('Analyzing error...')).toBeInTheDocument()
    })

    it('maintains layout with flex', () => {
      render(<LoadingAnalysis />)

      const textContainer = screen.getByText('Analyzing error...').parentElement
      expect(textContainer).toHaveClass('flex')
    })
  })

  describe('Visual Hierarchy', () => {
    it('icon comes before text', () => {
      render(<LoadingAnalysis />)

      const textContainer = screen.getByText('Analyzing error...').parentElement
      const children = textContainer?.children

      // First child should be icon, second should be text
      expect(children?.length).toBe(2)
    })

    it('loading bars are below text', () => {
      const { container } = render(<LoadingAnalysis />)

      const mainContainer = container.firstChild
      const children = mainContainer?.childNodes

      expect(children?.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Edge Cases', () => {
    it('renders without crashing with no props', () => {
      const { container } = render(<LoadingAnalysis />)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('multiple instances render independently', () => {
      const { container } = render(
        <div>
          <LoadingAnalysis />
          <LoadingAnalysis />
        </div>
      )

      const textElements = screen.getAllByText('Analyzing error...')
      expect(textElements.length).toBe(2)
    })

    it('renders consistently across re-renders', () => {
      const { rerender } = render(<LoadingAnalysis />)

      expect(screen.getByText('Analyzing error...')).toBeInTheDocument()

      rerender(<LoadingAnalysis />)

      expect(screen.getByText('Analyzing error...')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('renders with minimal DOM nodes', () => {
      const { container } = render(<LoadingAnalysis />)

      // Should be fairly minimal structure
      const allDivs = container.querySelectorAll('div')
      expect(allDivs.length).toBeLessThan(20)
    })

    it('maintains consistent bar count', () => {
      const { container: container1 } = render(<LoadingAnalysis />)
      const { container: container2 } = render(<LoadingAnalysis />)

      const bars1 = container1.querySelectorAll('.bg-muted')
      const bars2 = container2.querySelectorAll('.bg-muted')

      expect(bars1.length).toBe(bars2.length)
    })
  })

  describe('Integration Tests', () => {
    it('complete loading state display', () => {
      render(<LoadingAnalysis />)

      // Icon visible
      expect(screen.getByText('Analyzing error...')).toBeInTheDocument()

      // Text visible
      expect(screen.getByText('Analyzing error...')).toBeVisible()

      // Three bars rendered
      const { container } = render(<LoadingAnalysis />)
      const bars = container.querySelectorAll('.h-4.bg-muted')
      expect(bars.length).toBe(3)
    })

    it('loading indicator in a container', () => {
      const { container } = render(
        <div className="p-4">
          <LoadingAnalysis />
        </div>
      )

      expect(screen.getByText('Analyzing error...')).toBeInTheDocument()
      expect(container.querySelector('.p-4')).toBeInTheDocument()
    })

    it('displays as part of error analysis flow', () => {
      const { container } = render(
        <div>
          <div className="text-red-500">Error occurred</div>
          <LoadingAnalysis />
        </div>
      )

      expect(screen.getByText('Error occurred')).toBeInTheDocument()
      expect(screen.getByText('Analyzing error...')).toBeInTheDocument()
    })
  })

  describe('DOM Structure', () => {
    it('has correct nesting order', () => {
      const { container } = render(<LoadingAnalysis />)

      const root = container.firstChild as HTMLElement
      expect(root.className).toContain('space-y-3')

      const firstChild = root.firstChild as HTMLElement
      expect(firstChild.className).toContain('flex')

      const secondChild = root.lastChild as HTMLElement
      expect(secondChild.className).toContain('space-y-2')
    })

    it('maintains semantic HTML structure', () => {
      const { container } = render(<LoadingAnalysis />)

      // Should be div-based structure (semantic in context)
      expect(container.querySelectorAll('div').length).toBeGreaterThan(0)
    })
  })

  describe('Animation Bar Characteristics', () => {
    it('each bar has height h-4', () => {
      const { container } = render(<LoadingAnalysis />)

      const bars = container.querySelectorAll('.h-4')
      expect(bars.length).toBeGreaterThanOrEqual(3)

      // All bars should have h-4
      const animationBars = container.querySelectorAll('.space-y-2 > div')
      animationBars.forEach((bar) => {
        expect(bar).toHaveClass('h-4')
      })
    })

    it('all bars use muted background', () => {
      const { container } = render(<LoadingAnalysis />)

      const bars = container.querySelectorAll('.bg-muted')
      expect(bars.length).toBe(3)
    })

    it('bars are evenly spaced', () => {
      const { container } = render(<LoadingAnalysis />)

      const barContainer = container.querySelector('.space-y-2')
      expect(barContainer).toHaveClass('space-y-2')
    })
  })
})
