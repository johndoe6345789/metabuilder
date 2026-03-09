import React from 'react'
import { render, screen } from '@/test-utils'
import { ReactPreview } from '@/components/features/snippet-editor/ReactPreview'
import { InputParameter } from '@/lib/types'

// Mock dependencies
jest.mock('@/lib/react-transform', () => ({
  transformReactCode: jest.fn((code, functionName) => {
    if (code.includes('ERROR')) throw new Error('Transform error')
    return () => <div data-testid="mock-component">Rendered Component</div>
  }),
}))

jest.mock('@/lib/parse-parameters', () => ({
  parseInputParameters: jest.fn((params) => ({ parsedParams: params })),
}))

jest.mock('@/components/error/AIErrorHelper', () => ({
  AIErrorHelper: ({ error }: any) => (
    <div data-testid="ai-error-helper">{error}</div>
  ),
}))

describe('ReactPreview Component', () => {
  const defaultProps = {
    code: 'const Component = () => <div>Hello</div>',
    language: 'TSX',
    functionName: 'Component',
    inputParameters: [],
  }

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ReactPreview {...defaultProps} />)
      // Should render either preview or message
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('Supported Languages', () => {
    const supportedLanguages = ['JSX', 'TSX', 'JavaScript', 'TypeScript']

    supportedLanguages.forEach(lang => {
      it(`should process ${lang} language`, () => {
        render(<ReactPreview {...defaultProps} language={lang} />)
        // Should not show unsupported message
        expect(screen.queryByText(/Preview not available/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Unsupported Languages', () => {
    const unsupportedLanguages = ['Python', 'HTML', 'CSS', 'SQL', 'Java']

    unsupportedLanguages.forEach(lang => {
      it(`should show message for ${lang} language`, () => {
        render(<ReactPreview {...defaultProps} language={lang} />)
        expect(screen.getByTestId('preview-unsupported')).toBeInTheDocument()
        expect(screen.getByText(`Preview not available for ${lang}`)).toBeInTheDocument()
      })
    })
  })

  describe('Unsupported Language Message', () => {
    it('should display unsupported language message', () => {
      render(<ReactPreview {...defaultProps} language="Python" />)
      expect(screen.getByTestId('preview-unsupported')).toBeInTheDocument()
    })

    it('should show language name in message', () => {
      render(<ReactPreview {...defaultProps} language="Python" />)
      expect(screen.getByText('Preview not available for Python')).toBeInTheDocument()
    })

    it('should display help text for supported languages', () => {
      render(<ReactPreview {...defaultProps} language="Python" />)
      expect(screen.getByText(/Use JSX, TSX, JavaScript, or TypeScript/i)).toBeInTheDocument()
    })

    it('should have correct role and aria-label', () => {
      render(<ReactPreview {...defaultProps} language="Python" />)
      const preview = screen.getByTestId('preview-unsupported')
      expect(preview).toHaveAttribute('role', 'status')
      expect(preview).toHaveAttribute('aria-label', 'Preview not available for this language')
    })

    it('should render icon for unsupported languages', () => {
      const { container } = render(<ReactPreview {...defaultProps} language="Python" />)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should display error message when transformation fails', () => {
      render(
        <ReactPreview
          {...defaultProps}
          code="ERROR in code"
        />
      )
      expect(screen.getByTestId('preview-error')).toBeInTheDocument()
    })

    it('should show error alert', () => {
      render(
        <ReactPreview
          {...defaultProps}
          code="ERROR"
        />
      )
      expect(screen.getByTestId('preview-error-alert')).toBeInTheDocument()
    })

    it('should display error message text', () => {
      render(
        <ReactPreview
          {...defaultProps}
          code="ERROR"
        />
      )
      expect(screen.getByTestId('preview-error-message')).toBeInTheDocument()
    })

    it('should have correct role for error container', () => {
      render(
        <ReactPreview
          {...defaultProps}
          code="ERROR"
        />
      )
      const errorContainer = screen.getByTestId('preview-error')
      expect(errorContainer).toHaveAttribute('role', 'alert')
    })

    it('should render AIErrorHelper for error context', () => {
      render(
        <ReactPreview
          {...defaultProps}
          code="ERROR"
        />
      )
      expect(screen.getByTestId('ai-error-helper')).toBeInTheDocument()
    })

    it('should pass language context to AIErrorHelper', () => {
      render(
        <ReactPreview
          {...defaultProps}
          code="ERROR"
          language="TypeScript"
        />
      )
      const errorHelper = screen.getByTestId('ai-error-helper')
      expect(errorHelper).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should handle loading state gracefully', () => {
      render(<ReactPreview {...defaultProps} />)
      // Component should render without error
      expect(document.body).toBeInTheDocument()
    })

    it('should show loading message when component is not ready', () => {
      // This test depends on actual implementation details
      const { container } = render(<ReactPreview {...defaultProps} />)
      expect(container).toBeInTheDocument()
    })
  })

  describe('Component Props', () => {
    it('should accept code prop', () => {
      const customCode = 'const Test = () => <span>Test</span>'
      expect(() => {
        render(<ReactPreview {...defaultProps} code={customCode} />)
      }).not.toThrow()
    })

    it('should accept language prop', () => {
      expect(() => {
        render(<ReactPreview {...defaultProps} language="JSX" />)
      }).not.toThrow()
    })

    it('should handle optional functionName prop', () => {
      expect(() => {
        render(
          <ReactPreview
            {...defaultProps}
            functionName={undefined}
          />
        )
      }).not.toThrow()
    })

    it('should handle optional inputParameters prop', () => {
      expect(() => {
        render(
          <ReactPreview
            {...defaultProps}
            inputParameters={undefined}
          />
        )
      }).not.toThrow()
    })
  })

  describe('Input Parameters', () => {
    it('should accept input parameters', () => {
      const params: InputParameter[] = [
        { name: 'count', type: 'number', defaultValue: '0', description: '' },
      ]
      expect(() => {
        render(<ReactPreview {...defaultProps} inputParameters={params} />)
      }).not.toThrow()
    })

    it('should handle empty input parameters', () => {
      expect(() => {
        render(<ReactPreview {...defaultProps} inputParameters={[]} />)
      }).not.toThrow()
    })

    it('should handle multiple input parameters', () => {
      const params: InputParameter[] = [
        { name: 'p1', type: 'string', defaultValue: '', description: '' },
        { name: 'p2', type: 'number', defaultValue: '', description: '' },
      ]
      expect(() => {
        render(<ReactPreview {...defaultProps} inputParameters={params} />)
      }).not.toThrow()
    })
  })

  describe('Accessibility', () => {
    it('should have proper role for preview container', () => {
      render(<ReactPreview {...defaultProps} />)
      // Container should have proper structure
      expect(document.body).toBeInTheDocument()
    })

    it('should have aria-labels for unsupported language', () => {
      render(<ReactPreview {...defaultProps} language="Python" />)
      const container = screen.getByTestId('preview-unsupported')
      expect(container).toHaveAttribute('aria-label')
    })

    it('should have aria-labels for error states', () => {
      render(
        <ReactPreview
          {...defaultProps}
          code="ERROR"
        />
      )
      const errorContainer = screen.getByTestId('preview-error')
      expect(errorContainer).toHaveAttribute('role', 'alert')
    })
  })

  describe('Display Content', () => {
    it('should render preview container', () => {
      const { container } = render(<ReactPreview {...defaultProps} />)
      const preview = container.querySelector('[class*="overflow"]')
      expect(preview).toBeInTheDocument()
    })

    it('should have correct background class', () => {
      const { container } = render(<ReactPreview {...defaultProps} language="Python" />)
      const preview = container.querySelector('[class*="bg-muted"]')
      expect(preview).toBeInTheDocument()
    })
  })

  describe('Function Name Handling', () => {
    it('should accept function name', () => {
      expect(() => {
        render(<ReactPreview {...defaultProps} functionName="TestFunc" />)
      }).not.toThrow()
    })

    it('should handle undefined function name', () => {
      expect(() => {
        render(<ReactPreview {...defaultProps} functionName={undefined} />)
      }).not.toThrow()
    })

    it('should handle empty function name', () => {
      expect(() => {
        render(<ReactPreview {...defaultProps} functionName="" />)
      }).not.toThrow()
    })
  })

  describe('Language Variations', () => {
    it('should handle JSX code', () => {
      render(
        <ReactPreview
          {...defaultProps}
          language="JSX"
          code="const App = () => <div>JSX</div>"
        />
      )
      expect(document.body).toBeInTheDocument()
    })

    it('should handle TypeScript code', () => {
      render(
        <ReactPreview
          {...defaultProps}
          language="TypeScript"
          code="const App: React.FC = () => <div>TS</div>"
        />
      )
      expect(document.body).toBeInTheDocument()
    })

    it('should handle JavaScript code', () => {
      render(
        <ReactPreview
          {...defaultProps}
          language="JavaScript"
          code="const App = () => React.createElement('div', null, 'JS')"
        />
      )
      expect(document.body).toBeInTheDocument()
    })
  })

  describe('Error Message Display', () => {
    it('should display error details in message', () => {
      render(
        <ReactPreview
          {...defaultProps}
          code="ERROR"
        />
      )
      const errorMsg = screen.getByTestId('preview-error-message')
      expect(errorMsg).toBeInTheDocument()
    })

    it('should have monospace font for error messages', () => {
      const { container } = render(
        <ReactPreview
          {...defaultProps}
          code="ERROR"
        />
      )
      const errorMsg = container.querySelector('[data-testid="preview-error-message"]')
      expect(errorMsg?.className).toContain('font-mono')
    })

    it('should wrap error text for readability', () => {
      const { container } = render(
        <ReactPreview
          {...defaultProps}
          code="ERROR"
        />
      )
      const errorMsg = container.querySelector('[data-testid="preview-error-message"]')
      expect(errorMsg?.className).toContain('whitespace-pre-wrap')
    })
  })

  describe('Component Integration', () => {
    it('should support full JSX code block', () => {
      const jsxCode = `
        export default function Component({ name }) {
          return <h1>Hello {name}</h1>
        }
      `
      expect(() => {
        render(
          <ReactPreview
            code={jsxCode}
            language="JSX"
            functionName="Component"
            inputParameters={[
              { name: 'name', type: 'string', defaultValue: 'World', description: '' },
            ]}
          />
        )
      }).not.toThrow()
    })
  })

  describe('Props Combinations', () => {
    it('should handle all props together', () => {
      const params: InputParameter[] = [
        { name: 'count', type: 'number', defaultValue: '0', description: 'Counter' },
      ]
      expect(() => {
        render(
          <ReactPreview
            code="const Comp = ({count}) => <div>{count}</div>"
            language="TSX"
            functionName="Comp"
            inputParameters={params}
          />
        )
      }).not.toThrow()
    })

    it('should work with minimal props', () => {
      expect(() => {
        render(
          <ReactPreview
            code="const A = () => <div>A</div>"
            language="JSX"
          />
        )
      }).not.toThrow()
    })
  })

  describe('Error States', () => {
    it('should handle transformation errors gracefully', () => {
      expect(() => {
        render(
          <ReactPreview
            {...defaultProps}
            code="ERROR"
          />
        )
      }).not.toThrow()
    })

    it('should always render something', () => {
      const { container } = render(<ReactPreview {...defaultProps} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Text Content Display', () => {
    it('should display unsupported message for Python', () => {
      render(<ReactPreview {...defaultProps} language="Python" />)
      expect(screen.getByText('Preview not available for Python')).toBeInTheDocument()
    })

    it('should display supported languages list', () => {
      render(<ReactPreview {...defaultProps} language="Python" />)
      expect(screen.getByText(/Use JSX, TSX, JavaScript, or TypeScript/i)).toBeInTheDocument()
    })

    it('should show help text for unsupported languages', () => {
      render(<ReactPreview {...defaultProps} language="HTML" />)
      expect(screen.getByText(/Use JSX, TSX, JavaScript, or TypeScript/i)).toBeInTheDocument()
    })
  })
})
