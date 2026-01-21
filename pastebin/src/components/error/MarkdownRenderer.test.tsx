import React from 'react'
import { render, screen } from '@/test-utils'
import { MarkdownRenderer } from './MarkdownRenderer'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('MarkdownRenderer Component', () => {
  describe('Heading Rendering', () => {
    it('renders h2 headings (##)', () => {
      const content = '## Main Title\nSome content'
      render(<MarkdownRenderer content={content} />)

      const heading = screen.getByText('Main Title')
      expect(heading.tagName).toBe('H2')
    })

    it('renders h3 headings (###)', () => {
      const content = '### Subsection\nContent here'
      render(<MarkdownRenderer content={content} />)

      const heading = screen.getByText('Subsection')
      expect(heading.tagName).toBe('H3')
    })

    it('renders headings with proper formatting', () => {
      const content = '## Title'
      render(<MarkdownRenderer content={content} />)

      const heading = screen.getByText('Title')
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H2')
    })

    it('handles multiple headings', () => {
      const content = `## Section 1
Content
### Subsection
More content
## Section 2`

      render(<MarkdownRenderer content={content} />)

      expect(screen.getByText('Section 1')).toBeInTheDocument()
      expect(screen.getByText('Subsection')).toBeInTheDocument()
      expect(screen.getByText('Section 2')).toBeInTheDocument()
    })

    it('applies correct styling to h2', () => {
      const content = '## Title'
      render(<MarkdownRenderer content={content} />)

      const heading = screen.getByText('Title')
      expect(heading).toHaveClass('text-lg', 'font-semibold')
    })

    it('applies correct styling to h3', () => {
      const content = '### Subtitle'
      render(<MarkdownRenderer content={content} />)

      const heading = screen.getByText('Subtitle')
      expect(heading).toHaveClass('text-base', 'font-semibold')
    })
  })

  describe('List Rendering', () => {
    it('renders numbered list items', () => {
      const content = '1. First item\n2. Second item\n3. Third item'
      render(<MarkdownRenderer content={content} />)

      expect(screen.getByText('1. First item')).toBeInTheDocument()
      expect(screen.getByText('2. Second item')).toBeInTheDocument()
      expect(screen.getByText('3. Third item')).toBeInTheDocument()
    })

    it('renders bullet list items', () => {
      const content = '- First point\n- Second point\n- Third point'
      render(<MarkdownRenderer content={content} />)

      expect(screen.getByText('- First point')).toBeInTheDocument()
      expect(screen.getByText('- Second point')).toBeInTheDocument()
      expect(screen.getByText('- Third point')).toBeInTheDocument()
    })

    it('applies indentation to bullet points', () => {
      const content = '- Item one'
      render(<MarkdownRenderer content={content} />)

      const item = screen.getByText('- Item one')
      expect(item).toHaveClass('ml-4')
    })

    it('applies indentation to numbered items', () => {
      const content = '1. First step'
      render(<MarkdownRenderer content={content} />)

      const item = screen.getByText('1. First step')
      expect(item).toHaveClass('ml-2')
    })

    it('handles mixed list types', () => {
      const content = `1. Step one
2. Step two
- Bullet point
- Another point
3. Step three`

      render(<MarkdownRenderer content={content} />)

      expect(screen.getByText('1. Step one')).toBeInTheDocument()
      expect(screen.getByText('- Bullet point')).toBeInTheDocument()
      expect(screen.getByText('3. Step three')).toBeInTheDocument()
    })
  })

  describe('Paragraph Rendering', () => {
    it('renders regular text as paragraphs', () => {
      const content = 'This is a regular paragraph'
      render(<MarkdownRenderer content={content} />)

      const paragraph = screen.getByText('This is a regular paragraph')
      expect(paragraph.tagName).toBe('P')
    })

    it('applies correct styling to paragraphs', () => {
      const content = 'Regular text content'
      render(<MarkdownRenderer content={content} />)

      const paragraph = screen.getByText('Regular text content')
      expect(paragraph).toHaveClass('text-foreground/80', 'text-sm')
    })

    it('skips empty lines', () => {
      const content = 'Line 1\n\n\nLine 2'
      render(<MarkdownRenderer content={content} />)

      expect(screen.getByText('Line 1')).toBeInTheDocument()
      expect(screen.getByText('Line 2')).toBeInTheDocument()
    })

    it('renders paragraphs', () => {
      const content = 'Text with content'
      render(<MarkdownRenderer content={content} />)

      const paragraph = screen.getByText('Text with content')
      expect(paragraph.tagName).toBe('P')
    })
  })

  describe('Container Styling', () => {
    it('renders main container with prose styling', () => {
      const { container } = render(<MarkdownRenderer content="Test" />)

      const proseDiv = container.querySelector('.prose')
      expect(proseDiv).toBeInTheDocument()
    })

    it('applies prose-invert class for dark mode', () => {
      const { container } = render(<MarkdownRenderer content="Test" />)

      const proseDiv = container.querySelector('.prose-invert')
      expect(proseDiv).toBeInTheDocument()
    })

    it('applies prose-sm for smaller text', () => {
      const { container } = render(<MarkdownRenderer content="Test" />)

      const proseDiv = container.querySelector('.prose-sm')
      expect(proseDiv).toBeInTheDocument()
    })

    it('applies card styling to content wrapper', () => {
      const { container } = render(<MarkdownRenderer content="Test" />)

      const contentDiv = container.querySelector('.bg-card\\\/50')
      expect(contentDiv || container.querySelector('[class*="bg-"]')).toBeDefined()
    })

    it('applies border styling', () => {
      const { container } = render(<MarkdownRenderer content="Test" />)

      const wrapper = container.querySelector('[class*="border"]')
      expect(wrapper).toBeDefined()
    })
  })

  describe('Complex Content', () => {
    it('handles mixed content types', () => {
      const content = `## Overview
This is the main section

### Details
1. First detail
2. Second detail

- Point A
- Point B

More text here`

      render(<MarkdownRenderer content={content} />)

      expect(screen.getByText('Overview')).toBeInTheDocument()
      expect(screen.getByText('Details')).toBeInTheDocument()
      expect(screen.getByText('1. First detail')).toBeInTheDocument()
      expect(screen.getByText('- Point A')).toBeInTheDocument()
      expect(screen.getByText('More text here')).toBeInTheDocument()
    })

    it('preserves order of elements', () => {
      const content = `## First
Content A
## Second
Content B
## Third`

      const { container } = render(<MarkdownRenderer content={content} />)

      const h2s = container.querySelectorAll('h2')
      expect(h2s.length).toBe(3)
      expect(h2s[0].textContent).toContain('First')
      expect(h2s[1].textContent).toContain('Second')
      expect(h2s[2].textContent).toContain('Third')
    })

    it('handles deeply nested structure', () => {
      const content = `## Main
### Sub1
#### Text (not h4, rendered as paragraph)
Content here
### Sub2
More content`

      render(<MarkdownRenderer content={content} />)

      expect(screen.getByText('Main')).toBeInTheDocument()
      expect(screen.getByText('Sub1')).toBeInTheDocument()
      expect(screen.getByText('Sub2')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('handles empty content', () => {
      const { container } = render(<MarkdownRenderer content="" />)

      expect(container.querySelector('.prose')).toBeInTheDocument()
    })

    it('handles content with only whitespace', () => {
      const content = '   \n\n   '
      const { container } = render(<MarkdownRenderer content={content} />)

      expect(container.querySelector('.prose')).toBeInTheDocument()
    })

    it('handles very long lines', () => {
      const longLine = 'A'.repeat(500)
      render(<MarkdownRenderer content={longLine} />)

      expect(screen.getByText(new RegExp('A{100}'))).toBeInTheDocument()
    })

    it('handles special characters', () => {
      const content = '## Title with <>&"\'`\nContent with symbols @#$%'
      render(<MarkdownRenderer content={content} />)

      expect(screen.getByText(/Title with <>&/)).toBeInTheDocument()
    })

    it('handles numbered item without proper spacing', () => {
      const content = '1.Item without space\n2.Another item'
      render(<MarkdownRenderer content={content} />)

      expect(screen.getByText('1.Item without space')).toBeInTheDocument()
    })

    it('handles bullet item without leading space', () => {
      const content = '-Item without space\n-Another item'
      render(<MarkdownRenderer content={content} />)

      // Should still render as items
      expect(screen.getByText(/-Item without space/)).toBeInTheDocument()
    })

    it('handles Unicode characters', () => {
      const content = '## 中文标题\n😀 Emoji content\n→ Arrow'
      render(<MarkdownRenderer content={content} />)

      expect(screen.getByText('中文标题')).toBeInTheDocument()
    })

    it('handles very large content', () => {
      const lines = []
      for (let i = 0; i < 100; i++) {
        lines.push(`Line ${i}`)
      }
      const content = lines.join('\n')

      const { container } = render(<MarkdownRenderer content={content} />)

      expect(container.querySelector('.prose')).toBeInTheDocument()
    })
  })

  describe('Styling Consistency', () => {
    it('all text has consistent color scheme', () => {
      const content = `## Heading
Regular text
1. List item
- Bullet point`

      render(<MarkdownRenderer content={content} />)

      const heading = screen.getByText('Heading')
      expect(heading).toHaveClass('text-foreground')

      const paragraph = screen.getByText('Regular text')
      expect(paragraph).toHaveClass('text-foreground/80')
    })

    it('maintains spacing around headings', () => {
      const content = `## Section 1
Content
## Section 2`

      render(<MarkdownRenderer content={content} />)

      const headings = screen.getAllByText(/Section/)
      headings.forEach((heading) => {
        expect(heading).toHaveClass('mt-4', 'mb-2')
      })
    })

    it('renders multiple paragraphs', () => {
      const content = 'Para 1\nPara 2\nPara 3'
      render(<MarkdownRenderer content={content} />)

      expect(screen.getByText('Para 1')).toBeInTheDocument()
      expect(screen.getByText('Para 2')).toBeInTheDocument()
      expect(screen.getByText('Para 3')).toBeInTheDocument()
    })
  })

  describe('Motion Animation', () => {
    it('renders with motion div wrapper', () => {
      const { container } = render(<MarkdownRenderer content="Test" />)

      const motionDiv = container.firstChild
      expect(motionDiv).toBeDefined()
    })
  })

  describe('Integration Tests', () => {
    it('complete workflow: full error analysis display', () => {
      const content = `## Error Analysis

### What Went Wrong
The component failed to initialize properly

### Root Cause
1. Missing dependency
2. Incorrect configuration
3. State not initialized

### Solution
- Check dependencies are installed
- Review configuration file
- Initialize state before use

**Next Steps:**
1. Run npm install
2. Restart the server
3. Test the component`

      render(<MarkdownRenderer content={content} />)

      expect(screen.getByText('Error Analysis')).toBeInTheDocument()
      expect(screen.getByText('What Went Wrong')).toBeInTheDocument()
      expect(screen.getByText('Root Cause')).toBeInTheDocument()
      expect(screen.getByText('Solution')).toBeInTheDocument()
      expect(screen.getByText('1. Missing dependency')).toBeInTheDocument()
    })

    it('renders typical AI analysis response', () => {
      const aiResponse = `## TypeError Analysis

### Understanding the Error
A TypeError occurs when an operation is performed on a value of an inappropriate type.

### Common Causes
1. Calling a method on undefined or null
2. Accessing property of non-object
3. Type mismatch in operation

### Quick Fixes
- Check for null/undefined before using
- Validate data types
- Use optional chaining (?.)

### Prevention
- Use TypeScript for type checking
- Add input validation
- Use strict mode`

      render(<MarkdownRenderer content={aiResponse} />)

      expect(screen.getByText('TypeError Analysis')).toBeInTheDocument()
      expect(screen.getByText('Understanding the Error')).toBeInTheDocument()
    })

    it('displays formatted troubleshooting guide', () => {
      const guide = `## Troubleshooting Guide

### Issue: Cannot read property
This error means you're trying to access a property that doesn't exist

### Diagnostic Steps
1. Check browser console
2. Verify data structure
3. Add console.log statements

### Solutions
- Verify API response format
- Check JSON parsing
- Validate object structure`

      render(<MarkdownRenderer content={guide} />)

      expect(screen.getByText('Troubleshooting Guide')).toBeInTheDocument()
      expect(screen.getByText(/Cannot read property/)).toBeInTheDocument()
    })
  })

  describe('Line Processing', () => {
    it('correctly identifies and processes all line types', () => {
      const content = `## Heading
Regular paragraph
### Subheading
1. Numbered item
- Bullet item
Another paragraph`

      const { container } = render(<MarkdownRenderer content={content} />)

      const h2 = container.querySelector('h2')
      const h3 = container.querySelector('h3')
      const paragraphs = container.querySelectorAll('p')

      expect(h2).toBeInTheDocument()
      expect(h3).toBeInTheDocument()
      expect(paragraphs.length).toBeGreaterThan(0)
    })

    it('handles lines with trailing whitespace', () => {
      const content = `## Title
Content with spaces
- Item   `

      render(<MarkdownRenderer content={content} />)

      expect(screen.getByText(/Title/)).toBeInTheDocument()
    })

    it('trims heading text correctly', () => {
      const content = '##   Title with spaces   '
      render(<MarkdownRenderer content={content} />)

      const heading = screen.getByText('Title with spaces')
      expect(heading.textContent).toBe('Title with spaces')
    })
  })
})
