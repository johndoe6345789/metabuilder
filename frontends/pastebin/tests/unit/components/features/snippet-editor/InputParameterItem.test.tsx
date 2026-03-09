
import { render, screen, fireEvent } from '@/test-utils'
import { InputParameterItem } from '@/components/features/snippet-editor/InputParameterItem'
import { InputParameter } from '@/lib/types'

describe('InputParameterItem', () => {
  const mockInputParameter: InputParameter = {
    name: 'testParam',
    type: 'string',
    defaultValue: '"hello"',
    description: 'A test parameter',
  }

  const defaultProps = {
    param: mockInputParameter,
    index: 0,
    onUpdate: jest.fn(),
    onRemove: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render the parameter item card', () => {
      render(<InputParameterItem {...defaultProps} />)
      expect(screen.getByTestId('param-item-0')).toBeInTheDocument()
    })

    it('should display all required input fields', () => {
      render(<InputParameterItem {...defaultProps} />)
      expect(screen.getByTestId('param-name-input-0')).toBeInTheDocument()
      expect(screen.getByTestId('param-type-select-0')).toBeInTheDocument()
      expect(screen.getByTestId('param-default-input-0')).toBeInTheDocument()
      expect(screen.getByTestId('param-description-input-0')).toBeInTheDocument()
    })

    it('should display parameter labels', () => {
      render(<InputParameterItem {...defaultProps} />)
      expect(screen.getByText('Name *')).toBeInTheDocument()
      expect(screen.getByText('Type')).toBeInTheDocument()
      expect(screen.getByText('Default Value *')).toBeInTheDocument()
      expect(screen.getByText('Description (Optional)')).toBeInTheDocument()
    })

    it('should display remove button', () => {
      render(<InputParameterItem {...defaultProps} />)
      expect(screen.getByTestId('remove-parameter-btn-0')).toBeInTheDocument()
    })

    it('should render correct test id for different indexes', () => {
      const { rerender } = render(<InputParameterItem {...defaultProps} index={0} />)
      expect(screen.getByTestId('param-item-0')).toBeInTheDocument()

      rerender(<InputParameterItem {...defaultProps} index={5} />)
      expect(screen.getByTestId('param-item-5')).toBeInTheDocument()
    })
  })

  describe('Input Fields - Name', () => {
    it('should display parameter name in name input', () => {
      render(<InputParameterItem {...defaultProps} />)
      const nameInput = screen.getByTestId('param-name-input-0') as HTMLInputElement
      expect(nameInput.value).toBe('testParam')
    })

    it('should call onUpdate with correct index and field when name changes', () => {
      const onUpdate = jest.fn()
      render(<InputParameterItem {...defaultProps} onUpdate={onUpdate} />)
      const nameInput = screen.getByTestId('param-name-input-0')
      fireEvent.change(nameInput, { target: { value: 'newName' } })
      expect(onUpdate).toHaveBeenCalledWith(0, 'name', 'newName')
    })

    it('should have name placeholder', () => {
      render(<InputParameterItem {...defaultProps} />)
      const nameInput = screen.getByTestId('param-name-input-0')
      expect(nameInput).toHaveAttribute('placeholder', 'paramName')
    })

    it('should have required attribute on name input', () => {
      render(<InputParameterItem {...defaultProps} />)
      const nameInput = screen.getByTestId('param-name-input-0')
      expect(nameInput).toHaveAttribute('required')
    })

    it('should have aria-required="true" on name input', () => {
      render(<InputParameterItem {...defaultProps} />)
      const nameInput = screen.getByTestId('param-name-input-0')
      expect(nameInput).toHaveAttribute('aria-required', 'true')
    })
  })

  describe('Input Fields - Type', () => {
    it('should display parameter type in select', () => {
      render(<InputParameterItem {...defaultProps} />)
      const typeSelect = screen.getByTestId('param-type-select-0')
      expect(typeSelect).toBeInTheDocument()
    })

    it('should call onUpdate when type is changed', () => {
      const onUpdate = jest.fn()
      render(<InputParameterItem {...defaultProps} onUpdate={onUpdate} />)
      const typeSelect = screen.getByTestId('param-type-select-0')
      fireEvent.click(typeSelect)
      const numberOption = screen.getByTestId('type-number')
      fireEvent.click(numberOption)
      expect(onUpdate).toHaveBeenCalledWith(0, 'type', 'number')
    })

    it('should display all type options', () => {
      render(<InputParameterItem {...defaultProps} />)
      const typeSelect = screen.getByTestId('param-type-select-0')
      fireEvent.click(typeSelect)
      expect(screen.getByTestId('type-string')).toBeInTheDocument()
      expect(screen.getByTestId('type-number')).toBeInTheDocument()
      expect(screen.getByTestId('type-boolean')).toBeInTheDocument()
      expect(screen.getByTestId('type-array')).toBeInTheDocument()
      expect(screen.getByTestId('type-object')).toBeInTheDocument()
    })

    it('should have correct labels for type options', () => {
      render(<InputParameterItem {...defaultProps} />)
      const typeSelect = screen.getByTestId('param-type-select-0')
      fireEvent.click(typeSelect)
      expect(screen.getByText('string')).toBeInTheDocument()
      expect(screen.getByText('number')).toBeInTheDocument()
      expect(screen.getByText('boolean')).toBeInTheDocument()
      expect(screen.getByText('array')).toBeInTheDocument()
      expect(screen.getByText('object')).toBeInTheDocument()
    })
  })

  describe('Input Fields - Default Value', () => {
    it('should display parameter default value', () => {
      render(<InputParameterItem {...defaultProps} />)
      const defaultInput = screen.getByTestId('param-default-input-0') as HTMLInputElement
      expect(defaultInput.value).toBe('"hello"')
    })

    it('should call onUpdate when default value changes', () => {
      const onUpdate = jest.fn()
      render(<InputParameterItem {...defaultProps} onUpdate={onUpdate} />)
      const defaultInput = screen.getByTestId('param-default-input-0')
      fireEvent.change(defaultInput, { target: { value: '"new value"' } })
      expect(onUpdate).toHaveBeenCalledWith(0, 'defaultValue', '"new value"')
    })

    it('should have correct placeholder for string type', () => {
      render(<InputParameterItem {...defaultProps} param={{ ...mockInputParameter, type: 'string' }} />)
      const defaultInput = screen.getByTestId('param-default-input-0')
      expect(defaultInput).toHaveAttribute('placeholder', '"Hello World"')
    })

    it('should have correct placeholder for number type', () => {
      render(<InputParameterItem {...defaultProps} param={{ ...mockInputParameter, type: 'number' }} />)
      const defaultInput = screen.getByTestId('param-default-input-0')
      expect(defaultInput).toHaveAttribute('placeholder', '42')
    })

    it('should have correct placeholder for boolean type', () => {
      render(<InputParameterItem {...defaultProps} param={{ ...mockInputParameter, type: 'boolean' }} />)
      const defaultInput = screen.getByTestId('param-default-input-0')
      expect(defaultInput).toHaveAttribute('placeholder', 'true')
    })

    it('should have correct placeholder for array type', () => {
      render(<InputParameterItem {...defaultProps} param={{ ...mockInputParameter, type: 'array' }} />)
      const defaultInput = screen.getByTestId('param-default-input-0')
      expect(defaultInput).toHaveAttribute('placeholder', '["item1", "item2"]')
    })

    it('should have correct placeholder for object type', () => {
      render(<InputParameterItem {...defaultProps} param={{ ...mockInputParameter, type: 'object' }} />)
      const defaultInput = screen.getByTestId('param-default-input-0')
      expect(defaultInput).toHaveAttribute('placeholder', '{"key": "value"}')
    })

    it('should have required attribute on default value input', () => {
      render(<InputParameterItem {...defaultProps} />)
      const defaultInput = screen.getByTestId('param-default-input-0')
      expect(defaultInput).toHaveAttribute('required')
    })

    it('should have aria-required="true" on default value input', () => {
      render(<InputParameterItem {...defaultProps} />)
      const defaultInput = screen.getByTestId('param-default-input-0')
      expect(defaultInput).toHaveAttribute('aria-required', 'true')
    })

    it('should have monospace font class', () => {
      render(<InputParameterItem {...defaultProps} />)
      const defaultInput = screen.getByTestId('param-default-input-0')
      expect(defaultInput).toHaveClass('font-mono')
    })
  })

  describe('Input Fields - Description', () => {
    it('should display parameter description', () => {
      render(<InputParameterItem {...defaultProps} />)
      const descInput = screen.getByTestId('param-description-input-0') as HTMLInputElement
      expect(descInput.value).toBe('A test parameter')
    })

    it('should call onUpdate when description changes', () => {
      const onUpdate = jest.fn()
      render(<InputParameterItem {...defaultProps} onUpdate={onUpdate} />)
      const descInput = screen.getByTestId('param-description-input-0')
      fireEvent.change(descInput, { target: { value: 'New description' } })
      expect(onUpdate).toHaveBeenCalledWith(0, 'description', 'New description')
    })

    it('should have description placeholder', () => {
      render(<InputParameterItem {...defaultProps} />)
      const descInput = screen.getByTestId('param-description-input-0')
      expect(descInput).toHaveAttribute('placeholder', 'What does this parameter do?')
    })

    it('should not have required attribute on description input', () => {
      render(<InputParameterItem {...defaultProps} />)
      const descInput = screen.getByTestId('param-description-input-0')
      expect(descInput).not.toHaveAttribute('required')
    })

    it('should handle empty description', () => {
      const paramWithoutDesc = { ...mockInputParameter, description: undefined }
      render(<InputParameterItem {...defaultProps} param={paramWithoutDesc} />)
      const descInput = screen.getByTestId('param-description-input-0') as HTMLInputElement
      expect(descInput.value).toBe('')
    })
  })

  describe('Remove Button', () => {
    it('should call onRemove with correct index when remove button clicked', () => {
      const onRemove = jest.fn()
      render(<InputParameterItem {...defaultProps} index={3} onRemove={onRemove} />)
      const removeBtn = screen.getByTestId('remove-parameter-btn-3')
      fireEvent.click(removeBtn)
      expect(onRemove).toHaveBeenCalledWith(3)
    })

    it('should have correct aria-label for remove button', () => {
      render(<InputParameterItem {...defaultProps} index={2} />)
      const removeBtn = screen.getByTestId('remove-parameter-btn-2')
      expect(removeBtn).toHaveAttribute('aria-label', 'Remove parameter 3')
    })

    it('should have ghost variant styling', () => {
      render(<InputParameterItem {...defaultProps} />)
      const removeBtn = screen.getByTestId('remove-parameter-btn-0')
      expect(removeBtn).toHaveClass('h-8', 'w-8', 'p-0')
    })

    it('should have destructive color', () => {
      render(<InputParameterItem {...defaultProps} />)
      const removeBtn = screen.getByTestId('remove-parameter-btn-0')
      expect(removeBtn).toHaveClass('text-destructive')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label for name input', () => {
      render(<InputParameterItem {...defaultProps} index={1} />)
      const nameInput = screen.getByTestId('param-name-input-1')
      expect(nameInput).toHaveAttribute('aria-label', 'Parameter 2 name')
    })

    it('should have aria-label for type select', () => {
      render(<InputParameterItem {...defaultProps} index={0} />)
      const typeSelect = screen.getByTestId('param-type-select-0')
      expect(typeSelect).toHaveAttribute('aria-label', 'Parameter 1 type')
    })

    it('should have aria-label for default value input', () => {
      render(<InputParameterItem {...defaultProps} index={2} />)
      const defaultInput = screen.getByTestId('param-default-input-2')
      expect(defaultInput).toHaveAttribute('aria-label', 'Parameter 3 default value')
    })

    it('should have aria-label for description input', () => {
      render(<InputParameterItem {...defaultProps} index={1} />)
      const descInput = screen.getByTestId('param-description-input-1')
      expect(descInput).toHaveAttribute('aria-label', 'Parameter 2 description')
    })

    it('should have proper HTML labels with htmlFor attributes', () => {
      render(<InputParameterItem {...defaultProps} index={0} />)
      const nameLabel = screen.getByText('Name *')
      expect(nameLabel).toHaveAttribute('for', 'param-name-0')
    })
  })

  describe('Edge Cases', () => {
    it('should handle parameter with empty name', () => {
      const emptyNameParam = { ...mockInputParameter, name: '' }
      render(<InputParameterItem {...defaultProps} param={emptyNameParam} />)
      const nameInput = screen.getByTestId('param-name-input-0') as HTMLInputElement
      expect(nameInput.value).toBe('')
    })

    it('should handle parameter with special characters in name', () => {
      const specialNameParam = { ...mockInputParameter, name: 'param_name-123' }
      render(<InputParameterItem {...defaultProps} param={specialNameParam} />)
      const nameInput = screen.getByTestId('param-name-input-0') as HTMLInputElement
      expect(nameInput.value).toBe('param_name-123')
    })

    it('should handle parameter with very long default value', () => {
      const longValue = '"' + 'x'.repeat(500) + '"'
      const longValueParam = { ...mockInputParameter, defaultValue: longValue }
      render(<InputParameterItem {...defaultProps} param={longValueParam} />)
      const defaultInput = screen.getByTestId('param-default-input-0') as HTMLInputElement
      expect(defaultInput.value).toBe(longValue)
    })

    it('should handle parameter with JSON in default value', () => {
      const jsonParam = { ...mockInputParameter, defaultValue: '{"key": "value"}' }
      render(<InputParameterItem {...defaultProps} param={jsonParam} />)
      const defaultInput = screen.getByTestId('param-default-input-0') as HTMLInputElement
      expect(defaultInput.value).toBe('{"key": "value"}')
    })

    it('should handle very large index number', () => {
      render(<InputParameterItem {...defaultProps} index={999} />)
      expect(screen.getByTestId('param-item-999')).toBeInTheDocument()
    })
  })

  describe('Type-Specific Behavior', () => {
    const types: InputParameter['type'][] = ['string', 'number', 'boolean', 'array', 'object']

    types.forEach((type) => {
      it(`should correctly handle ${type} type`, () => {
        const typedParam = { ...mockInputParameter, type }
        render(<InputParameterItem {...defaultProps} param={typedParam} />)
        expect(screen.getByTestId('param-type-select-0')).toBeInTheDocument()
      })
    })
  })

  describe('Multiple Updates', () => {
    it('should handle multiple sequential updates', () => {
      const onUpdate = jest.fn()
      render(<InputParameterItem {...defaultProps} onUpdate={onUpdate} />)

      const nameInput = screen.getByTestId('param-name-input-0')
      fireEvent.change(nameInput, { target: { value: 'newName' } })
      expect(onUpdate).toHaveBeenCalledWith(0, 'name', 'newName')

      const descInput = screen.getByTestId('param-description-input-0')
      fireEvent.change(descInput, { target: { value: 'new desc' } })
      expect(onUpdate).toHaveBeenCalledWith(0, 'description', 'new desc')

      expect(onUpdate).toHaveBeenCalledTimes(2)
    })
  })
})
