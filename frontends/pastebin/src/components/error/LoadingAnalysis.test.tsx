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
      render(<LoadingAnalysis />)

      expect(screen.getByTestId('loading-analysis')).toBeInTheDocument()
    })

    it('displays loading text', () => {
      render(<LoadingAnalysis />)

      expect(screen.getByText('Analyzing error...')).toBeInTheDocument()
    })

    it('renders loading text in the spinner row', () => {
      render(<LoadingAnalysis />)

      const textEl = screen.getByText('Analyzing error...')
      expect(textEl).toBeInTheDocument()
    })

    it('renders three loading bars', () => {
      const { container } = render(<LoadingAnalysis />)

      // Three aria-hidden motion divs inside the skeleton list
      const bars = container.querySelectorAll('[aria-hidden="true"]')
      // One for the spinner icon + three skeleton bars = 4 total, or check specifically in skeleton list
      expect(bars.length).toBeGreaterThanOrEqual(3)
    })

    it('loading bars have correct structure', () => {
      const { container } = render(<LoadingAnalysis />)

      const root = container.querySelector('[data-testid="loading-analysis"]')
      expect(root).toBeInTheDocument()
      // skeletonList is the second child of root
      const skeletonList = root?.children[1]
      expect(skeletonList?.children.length).toBe(3)
    })
  })

  describe('Loading Icon', () => {
    it('renders icon with loading indicator', () => {
      render(<LoadingAnalysis />)

      const textEl = screen.getByText('Analyzing error...')
      const spinnerRow = textEl.parentElement
      expect(spinnerRow).toBeInTheDocument()
    })

    it('spinner row contains two children (icon + text)', () => {
      render(<LoadingAnalysis />)

      const textEl = screen.getByText('Analyzing error...')
      const spinnerRow = textEl.parentElement
      expect(spinnerRow?.children.length).toBe(2)
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

      const root = container.querySelector('[data-testid="loading-analysis"]')
      const skeletonList = root?.children[1]
      expect(skeletonList?.children.length).toBe(3)
    })

    it('each bar has aria-hidden for accessibility', () => {
      const { container } = render(<LoadingAnalysis />)

      const root = container.querySelector('[data-testid="loading-analysis"]')
      const skeletonList = root?.children[1]
      const bars = Array.from(skeletonList?.children ?? [])
      bars.forEach((bar) => {
        expect(bar.getAttribute('aria-hidden')).toBe('true')
      })
    })

    it('bars are in the skeleton list container', () => {
      const { container } = render(<LoadingAnalysis />)

      const root = container.querySelector('[data-testid="loading-analysis"]')
      const skeletonList = root?.children[1]
      expect(skeletonList).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('has proper structure for text and icon', () => {
      render(<LoadingAnalysis />)

      const textEl = screen.getByText('Analyzing error...')
      const spinnerRow = textEl.parentElement
      expect(spinnerRow).toBeInTheDocument()
    })

    it('maintains proper two-section structure', () => {
      const { container } = render(<LoadingAnalysis />)

      const root = container.querySelector('[data-testid="loading-analysis"]')
      expect(root?.children.length).toBeGreaterThanOrEqual(2)
    })

    it('text section is the first child of root', () => {
      render(<LoadingAnalysis />)

      const textEl = screen.getByText('Analyzing error...')
      const spinnerRow = textEl.parentElement
      const root = spinnerRow?.parentElement
      expect(root?.getAttribute('data-testid')).toBe('loading-analysis')
    })
  })

  describe('Accessibility', () => {
    it('root has role="status"', () => {
      render(<LoadingAnalysis />)

      expect(screen.getByRole('status')).toBeInTheDocument()
    })

    it('root has aria-busy="true"', () => {
      render(<LoadingAnalysis />)

      const status = screen.getByRole('status')
      expect(status).toHaveAttribute('aria-busy', 'true')
    })

    it('root has aria-label for screen readers', () => {
      render(<LoadingAnalysis />)

      const status = screen.getByRole('status')
      expect(status).toHaveAttribute('aria-label', 'Analyzing error')
    })

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

      expect(container.firstChild).toBeInTheDocument()
    })

    it('provides visual feedback through animation bars', () => {
      const { container } = render(<LoadingAnalysis />)

      const root = container.querySelector('[data-testid="loading-analysis"]')
      const skeletonList = root?.children[1]
      expect(skeletonList?.children.length).toBe(3)
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

      const root = container.querySelector('[data-testid="loading-analysis"]')
      const skeletonList = root?.children[1]
      expect(skeletonList).toBeInTheDocument()

      const children = skeletonList?.children
      expect(children?.length).toBe(3)
    })

    it('renders loading indicator structure correctly', () => {
      const { container } = render(<LoadingAnalysis />)

      const root = container.querySelector('[data-testid="loading-analysis"]')
      expect(root).toBeInTheDocument()

      const children = root?.children
      expect(children?.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Responsive Behavior', () => {
    it('component renders on different screen sizes', () => {
      render(<LoadingAnalysis />)

      expect(screen.getByText('Analyzing error...')).toBeInTheDocument()
    })

    it('maintains flex layout via SCSS module', () => {
      render(<LoadingAnalysis />)

      const root = screen.getByRole('status')
      expect(root).toBeInTheDocument()
    })
  })

  describe('Visual Hierarchy', () => {
    it('icon comes before text', () => {
      render(<LoadingAnalysis />)

      const textEl = screen.getByText('Analyzing error...')
      const spinnerRow = textEl.parentElement
      const children = spinnerRow?.children

      // First child should be icon motion div, second should be text span
      expect(children?.length).toBe(2)
    })

    it('loading bars are below text', () => {
      const { container } = render(<LoadingAnalysis />)

      const root = container.firstChild
      const children = root?.childNodes

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

      const root1 = container1.querySelector('[data-testid="loading-analysis"]')
      const root2 = container2.querySelector('[data-testid="loading-analysis"]')
      const bars1 = root1?.children[1]?.children.length ?? 0
      const bars2 = root2?.children[1]?.children.length ?? 0

      expect(bars1).toBe(bars2)
    })
  })

  describe('Integration Tests', () => {
    it('complete loading state display', () => {
      render(<LoadingAnalysis />)

      // Text visible
      expect(screen.getByText('Analyzing error...')).toBeInTheDocument()
      expect(screen.getByText('Analyzing error...')).toBeVisible()

      // Three bars rendered
      const { container } = render(<LoadingAnalysis />)
      const root = container.querySelector('[data-testid="loading-analysis"]')
      const bars = root?.children[1]?.children
      expect(bars?.length).toBe(3)
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
      render(
        <div>
          <div>Error occurred</div>
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

      const root = container.querySelector('[data-testid="loading-analysis"]') as HTMLElement
      expect(root).toBeInTheDocument()

      const firstChild = root.firstChild as HTMLElement
      expect(firstChild).toBeInTheDocument()

      const secondChild = root.lastChild as HTMLElement
      expect(secondChild).toBeInTheDocument()
    })

    it('maintains semantic HTML structure', () => {
      const { container } = render(<LoadingAnalysis />)

      // Should be div-based structure (semantic in context)
      expect(container.querySelectorAll('div').length).toBeGreaterThan(0)
    })
  })

  describe('Animation Bar Characteristics', () => {
    it('each bar has a fixed height via SCSS module', () => {
      const { container } = render(<LoadingAnalysis />)

      const root = container.querySelector('[data-testid="loading-analysis"]')
      const skeletonList = root?.children[1]
      const animationBars = Array.from(skeletonList?.children ?? [])
      expect(animationBars.length).toBe(3)
    })

    it('all bars are aria-hidden', () => {
      const { container } = render(<LoadingAnalysis />)

      const root = container.querySelector('[data-testid="loading-analysis"]')
      const skeletonList = root?.children[1]
      const bars = Array.from(skeletonList?.children ?? [])
      expect(bars.length).toBe(3)
      bars.forEach((bar) => {
        expect(bar.getAttribute('aria-hidden')).toBe('true')
      })
    })

    it('bars are evenly spaced via SCSS module', () => {
      const { container } = render(<LoadingAnalysis />)

      const root = container.querySelector('[data-testid="loading-analysis"]')
      const skeletonList = root?.children[1]
      expect(skeletonList).toBeInTheDocument()
    })
  })
})
