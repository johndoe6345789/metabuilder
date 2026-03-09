
import { render, screen, fireEvent } from '@/test-utils'
import { InputParameterList } from '@/components/features/snippet-editor/InputParameterList'
import { InputParameter } from '@/lib/types'

// Mock InputParameterItem to simplify testing
jest.mock('@/components/features/snippet-editor/InputParameterItem', () => ({
  InputParameterItem: ({ param, index, onUpdate, onRemove }: any) => (
    <div data-testid={`param-item-${index}`}>
      <input
        value={param.name}
        onChange={(e) => onUpdate(index, 'name', e.target.value)}
        data-testid={`param-name-${index}`}
      />
      <button onClick={() => onRemove(index)} data-testid={`remove-btn-${index}`}>
        Remove
      </button>
    </div>
  ),
}))

describe('InputParameterList', () => {
  const mockInputParameters: InputParameter[] = [
    { name: 'param1', type: 'string', defaultValue: '"test"', description: 'First param' },
    { name: 'param2', type: 'number', defaultValue: '42', description: 'Second param' },
  ]

  const defaultProps = {
    inputParameters: mockInputParameters,
    functionName: 'MyComponent',
    onFunctionNameChange: jest.fn(),
    onAddParameter: jest.fn(),
    onRemoveParameter: jest.fn(),
    onUpdateParameter: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the input parameters card', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByTestId('input-parameters-card')).toBeInTheDocument()
    })

    it('should display the preview configuration title', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByText('Preview Configuration')).toBeInTheDocument()
    })

    it('should display function name label', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByText('Function/Component Name (Optional)')).toBeInTheDocument()
    })

    it('should display help text for function name', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByText('The name of the function or component to render. Leave empty to use the default export.')).toBeInTheDocument()
    })

    it('should render function name input', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByTestId('function-name-input')).toBeInTheDocument()
    })

    it('should render add parameter button', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByTestId('add-parameter-btn')).toBeInTheDocument()
    })
  })

  describe('Function Name Input', () => {
    it('should display current function name', () => {
      render(<InputParameterList {...defaultProps} functionName="TestFunc" />)
      const input = screen.getByTestId('function-name-input') as HTMLInputElement
      expect(input.value).toBe('TestFunc')
    })

    it('should call onFunctionNameChange when function name is updated', () => {
      const onFunctionNameChange = jest.fn()
      render(
        <InputParameterList {...defaultProps} onFunctionNameChange={onFunctionNameChange} />
      )
      const input = screen.getByTestId('function-name-input')
      fireEvent.change(input, { target: { value: 'NewFuncName' } })
      expect(onFunctionNameChange).toHaveBeenCalledWith('NewFuncName')
    })

    it('should have correct placeholder', () => {
      render(<InputParameterList {...defaultProps} />)
      const input = screen.getByTestId('function-name-input')
      expect(input).toHaveAttribute('placeholder', 'e.g., MyComponent')
    })

    it('should handle empty function name', () => {
      const onFunctionNameChange = jest.fn()
      render(
        <InputParameterList
          {...defaultProps}
          functionName=""
          onFunctionNameChange={onFunctionNameChange}
        />
      )
      const input = screen.getByTestId('function-name-input') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should have background color class', () => {
      render(<InputParameterList {...defaultProps} />)
      const input = screen.getByTestId('function-name-input')
      expect(input).toHaveClass('bg-background')
    })
  })

  describe('Add Parameter Button', () => {
    it('should call onAddParameter when add button is clicked', () => {
      const onAddParameter = jest.fn()
      render(<InputParameterList {...defaultProps} onAddParameter={onAddParameter} />)
      const addBtn = screen.getByTestId('add-parameter-btn')
      fireEvent.click(addBtn)
      expect(onAddParameter).toHaveBeenCalled()
    })

    it('should display add button text', () => {
      render(<InputParameterList {...defaultProps} />)
      expect(screen.getByText('Add Parameter')).toBeInTheDocument()
    })

    it('should have correct aria-label', () => {
      render(<InputParameterList {...defaultProps} />)
      const addBtn = screen.getByTestId('add-parameter-btn')
      expect(addBtn).toHaveAttribute('aria-label', 'Add new parameter')
    })

    it('should have gap styling for icon and text', () => {
      render(<InputParameterList {...defaultProps} />)
      const addBtn = screen.getByTestId('add-parameter-btn')
      expect(addBtn).toHaveClass('gap-2')
    })
  })

  describe('Parameters List', () => {
    it('should display parameters list label when parameters exist', () => {
      render(<InputParameterList {...defaultProps} inputParameters={mockInputParameters} />)
      expect(screen.getByText('Input Parameters (Props)')).toBeInTheDocument()
    })

    it('should not display parameters list label when no parameters exist', () => {
      render(<InputParameterList {...defaultProps} inputParameters={[]} />)
      expect(screen.queryByText('Input Parameters (Props)')).not.toBeInTheDocument()
    })

    it('should render all parameter items', () => {
      render(<InputParameterList {...defaultProps} inputParameters={mockInputParameters} />)
      expect(screen.getByTestId('param-item-0')).toBeInTheDocument()
      expect(screen.getByTestId('param-item-1')).toBeInTheDocument()
    })

    it('should not render parameter items when list is empty', () => {
      render(<InputParameterList {...defaultProps} inputParameters={[]} />)
      expect(screen.queryByTestId('param-item-0')).not.toBeInTheDocument()
    })

    it('should render correct number of parameter items', () => {
      const threeParams = [...mockInputParameters, { name: 'param3', type: 'boolean' as const, defaultValue: 'true' }]
      render(<InputParameterList {...defaultProps} inputParameters={threeParams} />)
      expect(screen.getByTestId('param-item-0')).toBeInTheDocument()
      expect(screen.getByTestId('param-item-1')).toBeInTheDocument()
      expect(screen.getByTestId('param-item-2')).toBeInTheDocument()
    })

    it('should pass correct props to InputParameterItem', () => {
      const onUpdateParameter = jest.fn()
      const onRemoveParameter = jest.fn()
      render(
        <InputParameterList
          {...defaultProps}
          inputParameters={mockInputParameters}
          onUpdateParameter={onUpdateParameter}
          onRemoveParameter={onRemoveParameter}
        />
      )

      const nameInput = screen.getByTestId('param-name-0')
      fireEvent.change(nameInput, { target: { value: 'updated' } })
      expect(onUpdateParameter).toHaveBeenCalledWith(0, 'name', 'updated')

      const removeBtn = screen.getByTestId('remove-btn-0')
      fireEvent.click(removeBtn)
      expect(onRemoveParameter).toHaveBeenCalledWith(0)
    })

    it('should have region role for parameters list', () => {
      render(<InputParameterList {...defaultProps} inputParameters={mockInputParameters} />)
      const region = screen.getByRole('region', { name: 'Input parameters list' })
      expect(region).toBeInTheDocument()
    })
  })

  describe('Conditional Rendering', () => {
    it('should show parameters section only when parameters exist', () => {
      const { rerender } = render(
        <InputParameterList {...defaultProps} inputParameters={[]} />
      )
      expect(screen.queryByText('Input Parameters (Props)')).not.toBeInTheDocument()

      rerender(
        <InputParameterList {...defaultProps} inputParameters={mockInputParameters} />
      )
      expect(screen.getByText('Input Parameters (Props)')).toBeInTheDocument()
    })

    it('should toggle parameters section visibility based on parameter count', () => {
      const { rerender } = render(
        <InputParameterList {...defaultProps} inputParameters={[mockInputParameters[0]]} />
      )
      expect(screen.getByText('Input Parameters (Props)')).toBeInTheDocument()
      expect(screen.getByTestId('param-item-0')).toBeInTheDocument()

      rerender(
        <InputParameterList {...defaultProps} inputParameters={[]} />
      )
      expect(screen.queryByText('Input Parameters (Props)')).not.toBeInTheDocument()
      expect(screen.queryByTestId('param-item-0')).not.toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should have correct card styling', () => {
      render(<InputParameterList {...defaultProps} />)
      const card = screen.getByTestId('input-parameters-card')
      expect(card).toHaveClass('bg-muted/30')
    })

    it('should have space-y-16 for main container', () => {
      render(<InputParameterList {...defaultProps} />)
      const card = screen.getByTestId('input-parameters-card')
      expect(card.parentElement).toHaveClass('space-y-16')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label for function name input', () => {
      render(<InputParameterList {...defaultProps} />)
      const input = screen.getByTestId('function-name-input')
      expect(input).toHaveAttribute('aria-label', 'Function or component name')
    })

    it('should have aria-describedby for function name input', () => {
      render(<InputParameterList {...defaultProps} />)
      const input = screen.getByTestId('function-name-input')
      expect(input).toHaveAttribute('aria-describedby', 'function-name-help')
    })

    it('should have id on help text for aria-describedby', () => {
      render(<InputParameterList {...defaultProps} />)
      const helpText = document.getElementById('function-name-help')
      expect(helpText).toBeInTheDocument()
    })

    it('should have proper heading structure', () => {
      render(<InputParameterList {...defaultProps} inputParameters={mockInputParameters} />)
      expect(screen.getByTestId('preview-config-title')).toBeInTheDocument()
    })

    it('should have role region for parameters list', () => {
      render(<InputParameterList {...defaultProps} inputParameters={mockInputParameters} />)
      const region = screen.getByRole('region')
      expect(region).toHaveAttribute('aria-label', 'Input parameters list')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty function name', () => {
      render(<InputParameterList {...defaultProps} functionName="" />)
      const input = screen.getByTestId('function-name-input') as HTMLInputElement
      expect(input.value).toBe('')
    })

    it('should handle very long function name', () => {
      const longName = 'VeryLongFunctionName'.repeat(10)
      render(<InputParameterList {...defaultProps} functionName={longName} />)
      const input = screen.getByTestId('function-name-input') as HTMLInputElement
      expect(input.value).toBe(longName)
    })

    it('should handle special characters in function name', () => {
      const specialName = 'MyFunc_123'
      render(<InputParameterList {...defaultProps} functionName={specialName} />)
      const input = screen.getByTestId('function-name-input') as HTMLInputElement
      expect(input.value).toBe(specialName)
    })

    it('should handle single parameter', () => {
      const singleParam = [mockInputParameters[0]]
      render(<InputParameterList {...defaultProps} inputParameters={singleParam} />)
      expect(screen.getByTestId('param-item-0')).toBeInTheDocument()
      expect(screen.getByText('Input Parameters (Props)')).toBeInTheDocument()
    })

    it('should handle many parameters', () => {
      const manyParams = Array.from({ length: 10 }, (_, i) => ({
        name: `param${i}`,
        type: 'string' as const,
        defaultValue: `"value${i}"`,
      }))
      render(<InputParameterList {...defaultProps} inputParameters={manyParams} />)

      for (let i = 0; i < 10; i++) {
        expect(screen.getByTestId(`param-item-${i}`)).toBeInTheDocument()
      }
    })
  })

  describe('User Interactions', () => {
    it('should handle rapid add parameter clicks', () => {
      const onAddParameter = jest.fn()
      render(<InputParameterList {...defaultProps} onAddParameter={onAddParameter} />)
      const addBtn = screen.getByTestId('add-parameter-btn')

      fireEvent.click(addBtn)
      fireEvent.click(addBtn)
      fireEvent.click(addBtn)

      expect(onAddParameter).toHaveBeenCalledTimes(3)
    })

    it('should handle function name changes followed by parameter operations', () => {
      const onFunctionNameChange = jest.fn()
      const onAddParameter = jest.fn()
      render(
        <InputParameterList
          {...defaultProps}
          onFunctionNameChange={onFunctionNameChange}
          onAddParameter={onAddParameter}
        />
      )

      const nameInput = screen.getByTestId('function-name-input')
      fireEvent.change(nameInput, { target: { value: 'NewName' } })
      expect(onFunctionNameChange).toHaveBeenCalledWith('NewName')

      const addBtn = screen.getByTestId('add-parameter-btn')
      fireEvent.click(addBtn)
      expect(onAddParameter).toHaveBeenCalled()
    })
  })

  describe('Parameter Item Integration', () => {
    it('should render parameter with correct index', () => {
      const params = [
        { name: 'first', type: 'string' as const, defaultValue: '"a"' },
        { name: 'second', type: 'number' as const, defaultValue: '1' },
      ]
      render(<InputParameterList {...defaultProps} inputParameters={params} />)
      expect(screen.getByTestId('param-item-0')).toBeInTheDocument()
      expect(screen.getByTestId('param-item-1')).toBeInTheDocument()
    })

    it('should maintain parameter items after function name change', () => {
      const onFunctionNameChange = jest.fn()
      const { rerender } = render(
        <InputParameterList
          {...defaultProps}
          functionName="Func1"
          onFunctionNameChange={onFunctionNameChange}
          inputParameters={mockInputParameters}
        />
      )

      expect(screen.getByTestId('param-item-0')).toBeInTheDocument()
      expect(screen.getByTestId('param-item-1')).toBeInTheDocument()

      rerender(
        <InputParameterList
          {...defaultProps}
          functionName="Func2"
          onFunctionNameChange={onFunctionNameChange}
          inputParameters={mockInputParameters}
        />
      )

      expect(screen.getByTestId('param-item-0')).toBeInTheDocument()
      expect(screen.getByTestId('param-item-1')).toBeInTheDocument()
    })
  })
})
