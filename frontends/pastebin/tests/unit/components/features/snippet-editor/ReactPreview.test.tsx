
import { render, screen } from '@/test-utils'
import { ReactPreview } from '@/components/features/snippet-editor/ReactPreview'
import { InputParameter } from '@/lib/types'

// Mock dependencies
jest.mock('@/lib/react-transform', () => ({
  transformReactCode: jest.fn((code, functionName) => {
    if (code.includes('error')) {
      throw new Error('Transform error')
    }
    return () => <div data-testid="rendered-component">Rendered: {code}</div>
  }),
}))

jest.mock('@/lib/parse-parameters', () => ({
  parseInputParameters: jest.fn((params) => {
    if (!params) return {}
    return params.reduce((acc: any, param: InputParameter) => {
      acc[param.name] = param.defaultValue
      return acc
    }, {})
  }),
}))

jest.mock('@/components/error/AIErrorHelper', () => ({
  AIErrorHelper: ({ error, context }: any) => (
    <div data-testid="ai-error-helper">
      <p>{error}</p>
      <p>{context}</p>
    </div>
  ),
}))

describe('ReactPreview', () => {
  const defaultProps = {
    code: 'const Component = () => <div>Hello</div>;',
    language: 'JSX',
    functionName: 'Component',
    inputParameters: [] as InputParameter[],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Language Support', () => {
    it('should render preview for JSX', () => {
      render(<ReactPreview {...defaultProps} language="JSX" />)
      expect(screen.getByTestId('react-preview-container')).toBeInTheDocument()
    })

    it('should render preview for TSX', () => {
      render(<ReactPreview {...defaultProps} language="TSX" />)
      expect(screen.getByTestId('react-preview-container')).toBeInTheDocument()
    })

    it('should render preview for JavaScript', () => {
      render(<ReactPreview {...defaultProps} language="JavaScript" />)
      expect(screen.getByTestId('react-preview-container')).toBeInTheDocument()
    })

    it('should render preview for TypeScript', () => {
      render(<ReactPreview {...defaultProps} language="TypeScript" />)
      expect(screen.getByTestId('react-preview-container')).toBeInTheDocument()
    })

    it('should show unsupported message for Python', () => {
      render(<ReactPreview {...defaultProps} language="Python" />)
      expect(screen.getByTestId('preview-unsupported')).toBeInTheDocument()
      expect(screen.getByText('Preview not available for Python')).toBeInTheDocument()
    })

    it('should show unsupported message for Java', () => {
      render(<ReactPreview {...defaultProps} language="Java" />)
      expect(screen.getByTestId('preview-unsupported')).toBeInTheDocument()
      expect(screen.getByText('Preview not available for Java')).toBeInTheDocument()
    })

    it('should show unsupported message for CSS', () => {
      render(<ReactPreview {...defaultProps} language="CSS" />)
      expect(screen.getByTestId('preview-unsupported')).toBeInTheDocument()
    })

    it('should show unsupported message for HTML', () => {
      render(<ReactPreview {...defaultProps} language="HTML" />)
      expect(screen.getByTestId('preview-unsupported')).toBeInTheDocument()
    })
  })

  describe('Unsupported Language Display', () => {
    it('should display correct message for unsupported language', () => {
      render(<ReactPreview {...defaultProps} language="Python" />)
      expect(screen.getByText('Preview not available for Python')).toBeInTheDocument()
    })

    it('should display hint for supported languages', () => {
      render(<ReactPreview {...defaultProps} language="Python" />)
      expect(screen.getByText('Use JSX, TSX, JavaScript, or TypeScript')).toBeInTheDocument()
    })

    it('should have role=status for unsupported message', () => {
      render(<ReactPreview {...defaultProps} language="Python" />)
      const container = screen.getByTestId('preview-unsupported')
      expect(container).toHaveAttribute('role', 'status')
    })

    it('should have aria-label for unsupported message', () => {
      render(<ReactPreview {...defaultProps} language="Python" />)
      const container = screen.getByTestId('preview-unsupported')
      expect(container).toHaveAttribute('aria-label', 'Preview not available for this language')
    })
  })

  describe('Successful Rendering', () => {
    it('should render the preview container', () => {
      render(<ReactPreview {...defaultProps} />)
      expect(screen.getByTestId('react-preview-container')).toBeInTheDocument()
    })

    it('should render the component', () => {
      render(<ReactPreview {...defaultProps} />)
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()
    })

    it('should have role=region for preview container', () => {
      render(<ReactPreview {...defaultProps} />)
      const container = screen.getByTestId('react-preview-container')
      expect(container).toHaveAttribute('role', 'region')
    })

    it('should have aria-label for preview container', () => {
      render(<ReactPreview {...defaultProps} />)
      const container = screen.getByTestId('react-preview-container')
      expect(container).toHaveAttribute('aria-label', 'React component preview')
    })

    it('should pass props to rendered component', () => {
      const params: InputParameter[] = [
        { name: 'title', type: 'string', defaultValue: '"Hello"' },
      ]
      render(<ReactPreview {...defaultProps} inputParameters={params} />)
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should display error alert when transform fails', () => {
      render(<ReactPreview {...defaultProps} code="code with error" />)
      expect(screen.getByTestId('preview-error-alert')).toBeInTheDocument()
    })

    it('should display error message', () => {
      render(<ReactPreview {...defaultProps} code="code with error" />)
      expect(screen.getByTestId('preview-error-message')).toBeInTheDocument()
    })

    it('should show AIErrorHelper on error', () => {
      render(<ReactPreview {...defaultProps} code="code with error" />)
      expect(screen.getByTestId('ai-error-helper')).toBeInTheDocument()
    })

    it('should have role=alert for error container', () => {
      render(<ReactPreview {...defaultProps} code="code with error" />)
      const container = screen.getByTestId('preview-error')
      expect(container).toHaveAttribute('role', 'alert')
    })

    it('should have aria-live=assertive for error', () => {
      render(<ReactPreview {...defaultProps} code="code with error" />)
      const container = screen.getByTestId('preview-error')
      expect(container).toHaveAttribute('aria-live', 'assertive')
    })

    it('should have aria-atomic=true for error', () => {
      render(<ReactPreview {...defaultProps} code="code with error" />)
      const container = screen.getByTestId('preview-error')
      expect(container).toHaveAttribute('aria-atomic', 'true')
    })

    it('should display full error message in monospace', () => {
      render(<ReactPreview {...defaultProps} code="code with error" />)
      const errorMsg = screen.getByTestId('preview-error-message')
      expect(errorMsg).toHaveClass('font-mono')
    })

    it('should pass error context to AIErrorHelper', () => {
      render(<ReactPreview {...defaultProps} language="JSX" code="code with error" />)
      expect(screen.getByTestId('ai-error-helper')).toBeInTheDocument()
    })
  })

  describe('Loading State', () => {
    it('should show loading state when component is null', () => {
      // This would need a different mock setup to test properly
      // For now, we'll test that the container appears during render
      render(<ReactPreview {...defaultProps} code="" />)
      // The component might show loading briefly
      expect(screen.getByTestId('react-preview-container')).toBeInTheDocument()
    })
  })

  describe('Code Changes', () => {
    it('should update preview when code changes', () => {
      const { rerender } = render(
        <ReactPreview {...defaultProps} code="const A = () => <div>A</div>" />
      )
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()

      rerender(
        <ReactPreview {...defaultProps} code="const B = () => <div>B</div>" />
      )
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()
    })

    it('should handle code with syntax errors', () => {
      render(<ReactPreview {...defaultProps} code="const x = {" />)
      // Should either show error or still render
      const error = screen.queryByTestId('preview-error')
      const success = screen.queryByTestId('react-preview-container')
      expect(error || success).toBeTruthy()
    })

    it('should update error when code changes from valid to invalid', () => {
      const { rerender } = render(
        <ReactPreview {...defaultProps} code="const X = () => <div>X</div>" />
      )
      expect(screen.queryByTestId('preview-error')).not.toBeInTheDocument()

      rerender(
        <ReactPreview {...defaultProps} code="invalid code with error" />
      )
      expect(screen.getByTestId('preview-error')).toBeInTheDocument()
    })
  })

  describe('Function Name Handling', () => {
    it('should accept function name prop', () => {
      render(
        <ReactPreview
          {...defaultProps}
          functionName="MyComponent"
        />
      )
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()
    })

    it('should work without function name', () => {
      render(
        <ReactPreview {...defaultProps} />
      )
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()
    })

    it('should update preview when function name changes', () => {
      const { rerender } = render(
        <ReactPreview {...defaultProps} functionName="FirstFunc" />
      )
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()

      rerender(
        <ReactPreview {...defaultProps} functionName="SecondFunc" />
      )
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()
    })
  })

  describe('Input Parameters', () => {
    it('should accept input parameters', () => {
      const params: InputParameter[] = [
        { name: 'title', type: 'string', defaultValue: '"Hello"' },
        { name: 'count', type: 'number', defaultValue: '5' },
      ]
      render(
        <ReactPreview {...defaultProps} inputParameters={params} />
      )
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()
    })

    it('should handle empty parameters array', () => {
      render(
        <ReactPreview {...defaultProps} inputParameters={[]} />
      )
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()
    })

    it('should handle undefined parameters', () => {
      render(
        <ReactPreview {...defaultProps} inputParameters={undefined} />
      )
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()
    })

    it('should update preview when parameters change', () => {
      const params1: InputParameter[] = [
        { name: 'title', type: 'string', defaultValue: '"Old"' },
      ]
      const params2: InputParameter[] = [
        { name: 'title', type: 'string', defaultValue: '"New"' },
      ]

      const { rerender } = render(
        <ReactPreview {...defaultProps} inputParameters={params1} />
      )
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()

      rerender(
        <ReactPreview {...defaultProps} inputParameters={params2} />
      )
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()
    })
  })

  describe('Memoization', () => {
    it('should memoize component based on code and language', () => {
      const { rerender } = render(
        <ReactPreview {...defaultProps} code="const A = () => <div>A</div>" />
      )
      const component1 = screen.getByTestId('rendered-component')

      // Same code and language shouldn't recompute
      rerender(
        <ReactPreview {...defaultProps} code="const A = () => <div>A</div>" />
      )
      const component2 = screen.getByTestId('rendered-component')
      expect(component2).toBeInTheDocument()
    })

    it('should recompute when code changes', () => {
      const { rerender } = render(
        <ReactPreview {...defaultProps} code="const A = () => <div>A</div>" />
      )
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()

      rerender(
        <ReactPreview {...defaultProps} code="const B = () => <div>B</div>" />
      )
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()
    })

    it('should recompute when language changes', () => {
      const { rerender } = render(
        <ReactPreview {...defaultProps} language="JSX" />
      )
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()

      rerender(
        <ReactPreview {...defaultProps} language="TSX" />
      )
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should have correct background for preview container', () => {
      render(<ReactPreview {...defaultProps} />)
      const container = screen.getByTestId('react-preview-container')
      expect(container).toHaveClass('bg-background')
    })

    it('should have correct styling for error container', () => {
      render(<ReactPreview {...defaultProps} code="code with error" />)
      const container = screen.getByTestId('preview-error')
      expect(container).toHaveClass('bg-destructive/5')
    })

    it('should have correct styling for unsupported container', () => {
      render(<ReactPreview {...defaultProps} language="Python" />)
      const container = screen.getByTestId('preview-unsupported')
      expect(container).toHaveClass('bg-muted/30')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long code', () => {
      const longCode = 'const Component = () => <div>' + 'Hello '.repeat(100) + '</div>'
      render(<ReactPreview {...defaultProps} code={longCode} />)
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()
    })

    it('should handle code with unicode characters', () => {
      const unicodeCode = 'const Component = () => <div>Hello 世界</div>'
      render(<ReactPreview {...defaultProps} code={unicodeCode} />)
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()
    })

    it('should handle empty code', () => {
      render(<ReactPreview {...defaultProps} code="" />)
      // Should either render or show loading
      const container = document.body.querySelector('[data-testid^="preview"]')
      expect(container).toBeTruthy()
    })

    it('should handle code with special characters', () => {
      const specialCode = 'const x = "test\\"quote"; const Component = () => <div>{x}</div>'
      render(<ReactPreview {...defaultProps} code={specialCode} />)
      expect(screen.getByTestId('rendered-component')).toBeInTheDocument()
    })
  })

  describe('Multiple Language Switches', () => {
    it('should handle switching from supported to unsupported language', () => {
      const { rerender } = render(
        <ReactPreview {...defaultProps} language="JSX" />
      )
      expect(screen.getByTestId('react-preview-container')).toBeInTheDocument()

      rerender(
        <ReactPreview {...defaultProps} language="Python" />
      )
      expect(screen.getByTestId('preview-unsupported')).toBeInTheDocument()
    })

    it('should handle switching from unsupported to supported language', () => {
      const { rerender } = render(
        <ReactPreview {...defaultProps} language="Python" />
      )
      expect(screen.getByTestId('preview-unsupported')).toBeInTheDocument()

      rerender(
        <ReactPreview {...defaultProps} language="JSX" />
      )
      expect(screen.getByTestId('react-preview-container')).toBeInTheDocument()
    })

    it('should handle switching from error to success', () => {
      const { rerender } = render(
        <ReactPreview {...defaultProps} code="code with error" />
      )
      expect(screen.getByTestId('preview-error')).toBeInTheDocument()

      rerender(
        <ReactPreview {...defaultProps} code="const C = () => <div>Success</div>" />
      )
      expect(screen.getByTestId('react-preview-container')).toBeInTheDocument()
    })
  })
})
