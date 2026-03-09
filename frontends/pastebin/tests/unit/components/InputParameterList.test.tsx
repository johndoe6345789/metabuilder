import React from 'react'
import { render, screen, fireEvent } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { InputParameterList } from '@/components/features/snippet-editor/InputParameterList'
import { InputParameter } from '@/lib/types'

describe('InputParameterList Component', () => {
  const mockOnFunctionNameChange = jest.fn()
  const mockOnAddParameter = jest.fn()
  const mockOnRemoveParameter = jest.fn()
  const mockOnUpdateParameter = jest.fn()

  const defaultProps = {
    inputParameters: [],
    functionName: 'MyComponent',
    onFunctionNameChange: mockOnFunctionNameChange,
    onAddParameter: mockOnAddParameter,
    onRemoveParameter: mockOnRemoveParameter,
    onUpdateParameter: mockOnUpdateParameter,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByText('Preview Configuration')).toBeInTheDocument()
    })

    it('should render Card component', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByText('Preview Configuration')).toBeInTheDocument()
    })

    it('should display component title', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByText('Preview Configuration')).toBeInTheDocument()
    })
  })

  describe('Function Name Section', () => {
    it('should render function name input label', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByText('Function/Component Name (Optional)')).toBeInTheDocument()
    })

    it('should render function name input field', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByTestId('function-name-input')).toBeInTheDocument()
    })

    it('should display current function name value', () => {
      render(<InputParameterList {...defaultProps} />)
      const input = screen.getByTestId('function-name-input') as HTMLInputElement
      expect(input.value).toBe('MyComponent')
    })

    it('should have correct placeholder', () => {
      render(<InputParameterList {...defaultProps} />)
      const input = screen.getByTestId('function-name-input')
      expect(input).toHaveAttribute('placeholder', 'e.g., MyComponent')
    })

    it('should display help text', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByText('The name of the function or component to render. Leave empty to use the default export.')).toBeInTheDocument()
    })

    it('should call onFunctionNameChange when input changes', async () => {
      render(<InputParameterList {...defaultProps} />)

      const input = screen.getByTestId('function-name-input') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'NewComponent' } })

      expect(mockOnFunctionNameChange).toHaveBeenCalledWith('NewComponent')
    })

    it('should have aria-label', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByLabelText('Function or component name')).toBeInTheDocument()
    })

    it('should have aria-describedby', () => {
      render(<InputParameterList {...defaultProps} />)
      const input = screen.getByTestId('function-name-input')
      expect(input).toHaveAttribute('aria-describedby', 'function-name-help')
    })
  })

  describe('Add Parameter Button', () => {
    it('should render add parameter button', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByTestId('add-parameter-btn')).toBeInTheDocument()
    })

    it('should display correct button text', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByText('Add Parameter')).toBeInTheDocument()
    })

    it('should call onAddParameter when clicked', async () => {
      const user = userEvent.setup()
      render(<InputParameterList {...defaultProps} />)

      const button = screen.getByTestId('add-parameter-btn')
      await user.click(button)

      expect(mockOnAddParameter).toHaveBeenCalled()
    })

    it('should have aria-label', () => {
      render(<InputParameterList {...defaultProps} />)
      const button = screen.getByTestId('add-parameter-btn')
      expect(button).toHaveAttribute('aria-label', 'Add new parameter')
    })

    it('should have icon in button', () => {
      const { container } = render(<InputParameterList {...defaultProps} />)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Parameters Display', () => {
    it('should not display parameters section when list is empty', () => {
      render(<InputParameterList {...defaultProps} inputParameters={[]} />)
      expect(screen.queryByText('Input Parameters (Props)')).not.toBeInTheDocument()
    })

    it('should display parameters section when list has items', () => {
      const params: InputParameter[] = [
        { name: 'count', type: 'number', defaultValue: '0', description: '' },
      ]
      render(<InputParameterList {...defaultProps} inputParameters={params} />)
      expect(screen.getByText('Input Parameters (Props)')).toBeInTheDocument()
    })

    it('should render parameter items', () => {
      const params: InputParameter[] = [
        { name: 'count', type: 'number', defaultValue: '0', description: 'Counter' },
        { name: 'name', type: 'string', defaultValue: 'John', description: 'User name' },
      ]
      render(<InputParameterList {...defaultProps} inputParameters={params} />)
      expect(screen.getByTestId('param-name-input-0')).toBeInTheDocument()
      expect(screen.getByTestId('param-name-input-1')).toBeInTheDocument()
    })

    it('should render correct number of parameter items', () => {
      const params: InputParameter[] = [
        { name: 'param1', type: 'string', defaultValue: 'a', description: '' },
        { name: 'param2', type: 'number', defaultValue: '1', description: '' },
        { name: 'param3', type: 'boolean', defaultValue: 'true', description: '' },
      ]
      render(<InputParameterList {...defaultProps} inputParameters={params} />)
      expect(screen.getByTestId('param-name-input-0')).toBeInTheDocument()
      expect(screen.getByTestId('param-name-input-1')).toBeInTheDocument()
      expect(screen.getByTestId('param-name-input-2')).toBeInTheDocument()
    })
  })

  describe('Parameter Item Integration', () => {
    it('should pass onUpdate callback to parameter items', async () => {
      const params: InputParameter[] = [
        { name: 'count', type: 'number', defaultValue: '0', description: '' },
      ]
      render(<InputParameterList {...defaultProps} inputParameters={params} />)

      const input = screen.getByTestId('param-name-input-0') as HTMLInputElement
      fireEvent.change(input, { target: { value: 'newCount' } })

      expect(mockOnUpdateParameter).toHaveBeenCalledWith(0, 'name', 'newCount')
    })

    it('should pass onRemove callback to parameter items', async () => {
      const user = userEvent.setup()
      const params: InputParameter[] = [
        { name: 'count', type: 'number', defaultValue: '0', description: '' },
      ]
      render(<InputParameterList {...defaultProps} inputParameters={params} />)

      const removeButton = screen.getByTestId('remove-parameter-btn-0')
      await user.click(removeButton)

      expect(mockOnRemoveParameter).toHaveBeenCalledWith(0)
    })
  })

  describe('Component Structure', () => {
    it('should render Card with background styling', () => {
      const { container } = render(<InputParameterList {...defaultProps} />)
      const card = container.querySelector('[class*="bg-muted"]')
      expect(card).toBeInTheDocument()
    })

    it('should have CardHeader with padding', () => {
      const { container } = render(<InputParameterList {...defaultProps} />)
      const header = container.querySelector('[class*="pb-3"]')
      expect(header).toBeInTheDocument()
    })

    it('should have CardContent with spacing', () => {
      const { container } = render(<InputParameterList {...defaultProps} />)
      const content = container.querySelector('[class*="space-y"]')
      expect(content).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have semantic structure', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByText('Preview Configuration')).toBeInTheDocument()
    })

    it('should have accessible input label', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByLabelText('Function or component name')).toBeInTheDocument()
    })

    it('should have accessible button', () => {
      render(<InputParameterList {...defaultProps} />)
      const button = screen.getByTestId('add-parameter-btn')
      expect(button).toHaveAttribute('aria-label', 'Add new parameter')
    })

    it('should have help text with proper id', () => {
      render(<InputParameterList {...defaultProps} />)
      const helpText = screen.getByText(/The name of the function or component to render/)
      expect(helpText).toHaveAttribute('id', 'function-name-help')
    })
  })

  describe('Dynamic Content Rendering', () => {
    it('should render different number of parameters', () => {
      const { rerender } = render(<InputParameterList {...defaultProps} inputParameters={[]} />)
      expect(screen.queryByText('Input Parameters (Props)')).not.toBeInTheDocument()

      const params: InputParameter[] = [
        { name: 'param1', type: 'string', defaultValue: '', description: '' },
      ]
      rerender(<InputParameterList {...defaultProps} inputParameters={params} />)
      expect(screen.getByText('Input Parameters (Props)')).toBeInTheDocument()
    })

    it('should update function name input value', () => {
      const { rerender } = render(<InputParameterList {...defaultProps} functionName="OldName" />)
      let input = screen.getByTestId('function-name-input') as HTMLInputElement
      expect(input.value).toBe('OldName')

      rerender(<InputParameterList {...defaultProps} functionName="NewName" />)
      input = screen.getByTestId('function-name-input') as HTMLInputElement
      expect(input.value).toBe('NewName')
    })
  })

  describe('Props Validation', () => {
    it('should accept all required props', () => {
      expect(() => {
        render(<InputParameterList {...defaultProps} />)
      }).not.toThrow()
    })

    it('should handle empty input parameters array', () => {
      expect(() => {
        render(<InputParameterList {...defaultProps} inputParameters={[]} />)
      }).not.toThrow()
    })

    it('should handle multiple input parameters', () => {
      const params: InputParameter[] = [
        { name: 'p1', type: 'string', defaultValue: '', description: '' },
        { name: 'p2', type: 'number', defaultValue: '', description: '' },
        { name: 'p3', type: 'boolean', defaultValue: '', description: '' },
      ]
      expect(() => {
        render(<InputParameterList {...defaultProps} inputParameters={params} />)
      }).not.toThrow()
    })

    it('should handle empty function name', () => {
      expect(() => {
        render(<InputParameterList {...defaultProps} functionName="" />)
      }).not.toThrow()
    })
  })

  describe('Button Positioning', () => {
    it('should position add button in header with title', () => {
      const { container } = render(<InputParameterList {...defaultProps} />)
      const header = container.querySelector('[class*="flex"][class*="items-center"][class*="justify-between"]')
      expect(header).toBeInTheDocument()
    })

    it('should have gap between title and button', () => {
      const { container } = render(<InputParameterList {...defaultProps} />)
      const titleContainer = container.querySelector('[class*="flex"][class*="items-center"]')
      expect(titleContainer?.className).toContain('justify-between')
    })
  })

  describe('Text Labels and Help', () => {
    it('should display correct label text', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByText('Function/Component Name (Optional)')).toBeInTheDocument()
    })

    it('should display descriptive help text', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByText('The name of the function or component to render. Leave empty to use the default export.')).toBeInTheDocument()
    })

    it('should display parameters label when parameters exist', () => {
      const params: InputParameter[] = [
        { name: 'test', type: 'string', defaultValue: '', description: '' },
      ]
      render(<InputParameterList {...defaultProps} inputParameters={params} />)
      expect(screen.getByText('Input Parameters (Props)')).toBeInTheDocument()
    })
  })

  describe('Form Interaction Flow', () => {
    it('should handle complete flow: input function name and add parameters', async () => {
      const user = userEvent.setup()
      render(<InputParameterList {...defaultProps} />)

      // Change function name
      const funcInput = screen.getByTestId('function-name-input') as HTMLInputElement
      fireEvent.change(funcInput, { target: { value: 'TestFunc' } })
      expect(mockOnFunctionNameChange).toHaveBeenCalledWith('TestFunc')

      // Add parameter
      const addButton = screen.getByTestId('add-parameter-btn')
      await user.click(addButton)
      expect(mockOnAddParameter).toHaveBeenCalled()
    })
  })

  describe('Error States', () => {
    it('should render gracefully with all required props', () => {
      expect(() => {
        render(<InputParameterList {...defaultProps} />)
      }).not.toThrow()
    })

    it('should not crash with undefined function name', () => {
      expect(() => {
        render(
          <InputParameterList
            {...defaultProps}
            functionName={undefined as any}
          />
        )
      }).not.toThrow()
    })
  })

  describe('Title and Header Section', () => {
    it('should render title as CardTitle', () => {
      render(<InputParameterList {...defaultProps} />)
      const title = screen.getByText('Preview Configuration')
      expect(title).toBeInTheDocument()
    })

    it('should have title and button in same line', () => {
      const { container } = render(<InputParameterList {...defaultProps} />)
      const header = container.querySelector('[class*="justify-between"]')
      expect(header).toBeInTheDocument()
    })
  })
})
