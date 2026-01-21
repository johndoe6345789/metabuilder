import React from 'react'
import { render, screen, fireEvent } from '@/test-utils'
import userEvent from '@testing-library/user-event'
import { InputParameterItem } from '@/components/features/snippet-editor/InputParameterItem'
import { InputParameter } from '@/lib/types'

describe('InputParameterItem Component', () => {
  const mockOnUpdate = jest.fn()
  const mockOnRemove = jest.fn()

  const defaultParam: InputParameter = {
    name: 'userName',
    type: 'string',
    defaultValue: 'John',
    description: 'User full name',
  }

  const defaultProps = {
    param: defaultParam,
    index: 0,
    onUpdate: mockOnUpdate,
    onRemove: mockOnRemove,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<InputParameterItem {...defaultProps} />)
      expect(screen.getByTestId('param-name-input-0')).toBeInTheDocument()
    })

    it('should render Card component wrapper', () => {
      const { container } = render(<InputParameterItem {...defaultProps} />)
      // Check for the card wrapper by looking for the param item container
      expect(screen.getByTestId('param-item-0')).toBeInTheDocument()
    })
  })

  describe('Name Input Field', () => {
    it('should render name input with correct label', () => {
      render(<InputParameterItem {...defaultProps} />)
      expect(screen.getByLabelText('Parameter 1 name')).toBeInTheDocument()
    })

    it('should display name input with current value', () => {
      render(<InputParameterItem {...defaultProps} />)
      const input = screen.getByTestId('param-name-input-0') as HTMLInputElement
      expect(input.value).toBe('userName')
    })

    it('should have correct placeholder', () => {
      render(<InputParameterItem {...defaultProps} />)
      const input = screen.getByTestId('param-name-input-0')
      expect(input).toHaveAttribute('placeholder', 'paramName')
    })

    it('should call onUpdate when name changes', async () => {
      render(<InputParameterItem {...defaultProps} />)

      const input = screen.getByTestId('param-name-input-0') as HTMLInputElement
      // Manually set value and trigger change event using fireEvent
      fireEvent.change(input, { target: { value: 'newName' } })

      expect(mockOnUpdate).toHaveBeenCalledWith(0, 'name', 'newName')
    })

    it('should have correct testid', () => {
      render(<InputParameterItem {...defaultProps} />)
      expect(screen.getByTestId('param-name-input-0')).toBeInTheDocument()
    })

    it('should have aria-label for accessibility', () => {
      render(<InputParameterItem {...defaultProps} />)
      expect(screen.getByLabelText('Parameter 1 name')).toBeInTheDocument()
    })
  })

  describe('Type Select Field', () => {
    it('should render type select with current value', () => {
      render(<InputParameterItem {...defaultProps} />)
      expect(screen.getByTestId('param-type-select-0')).toBeInTheDocument()
    })

    it('should display current type in select', () => {
      render(<InputParameterItem {...defaultProps} />)
      const select = screen.getByTestId('param-type-select-0')
      expect(select).toBeInTheDocument()
    })

    it('should have all type options available', async () => {
      const user = userEvent.setup()
      render(<InputParameterItem {...defaultProps} />)

      // Open the select dropdown first
      const select = screen.getByTestId('param-type-select-0')
      await user.click(select)

      // Now check for options
      expect(screen.getByTestId('type-string')).toBeInTheDocument()
      expect(screen.getByTestId('type-number')).toBeInTheDocument()
      expect(screen.getByTestId('type-boolean')).toBeInTheDocument()
      expect(screen.getByTestId('type-array')).toBeInTheDocument()
      expect(screen.getByTestId('type-object')).toBeInTheDocument()
    })

    it('should call onUpdate when type changes', async () => {
      const user = userEvent.setup()
      render(<InputParameterItem {...defaultProps} />)

      const select = screen.getByTestId('param-type-select-0')
      await user.click(select)
      const numberOption = screen.getByTestId('type-number')
      await user.click(numberOption)

      expect(mockOnUpdate).toHaveBeenCalledWith(0, 'type', 'number')
    })

    it('should have aria-label for accessibility', () => {
      render(<InputParameterItem {...defaultProps} />)
      expect(screen.getByLabelText('Parameter 1 type')).toBeInTheDocument()
    })
  })

  describe('Default Value Input Field', () => {
    it('should render default value input with label', () => {
      render(<InputParameterItem {...defaultProps} />)
      expect(screen.getByLabelText('Parameter 1 default value')).toBeInTheDocument()
    })

    it('should display current default value', () => {
      render(<InputParameterItem {...defaultProps} />)
      const input = screen.getByTestId('param-default-input-0') as HTMLInputElement
      expect(input.value).toBe('John')
    })

    it('should have placeholder based on parameter type', () => {
      render(<InputParameterItem {...defaultProps} />)
      const input = screen.getByTestId('param-default-input-0')
      expect(input).toHaveAttribute('placeholder', '"Hello World"')
    })

    it('should update placeholder when type changes', () => {
      const { rerender } = render(<InputParameterItem {...defaultProps} />)
      rerender(
        <InputParameterItem
          {...defaultProps}
          param={{ ...defaultParam, type: 'number' }}
        />
      )
      const input = screen.getByTestId('param-default-input-0')
      expect(input).toHaveAttribute('placeholder', '42')
    })

    it('should call onUpdate when default value changes', async () => {
      render(<InputParameterItem {...defaultProps} />)

      const input = screen.getByTestId('param-default-input-0') as HTMLInputElement
      // Manually set value and trigger change event using fireEvent
      fireEvent.change(input, { target: { value: 'Jane' } })

      expect(mockOnUpdate).toHaveBeenCalledWith(0, 'defaultValue', 'Jane')
    })

    it('should have aria-label for accessibility', () => {
      render(<InputParameterItem {...defaultProps} />)
      expect(screen.getByLabelText('Parameter 1 default value')).toBeInTheDocument()
    })

    it('should have monospace font class', () => {
      const { container } = render(<InputParameterItem {...defaultProps} />)
      const input = container.querySelector('[data-testid="param-default-input-0"]')
      expect(input?.className).toContain('font-mono')
    })
  })

  describe('Description Input Field', () => {
    it('should render description input with label', () => {
      render(<InputParameterItem {...defaultProps} />)
      expect(screen.getByLabelText('Parameter 1 description')).toBeInTheDocument()
    })

    it('should display current description', () => {
      render(<InputParameterItem {...defaultProps} />)
      const input = screen.getByTestId('param-description-input-0') as HTMLInputElement
      expect(input.value).toBe('User full name')
    })

    it('should have placeholder text', () => {
      render(<InputParameterItem {...defaultProps} />)
      const input = screen.getByTestId('param-description-input-0')
      expect(input).toHaveAttribute('placeholder', 'What does this parameter do?')
    })

    it('should call onUpdate when description changes', async () => {
      render(<InputParameterItem {...defaultProps} />)

      const input = screen.getByTestId('param-description-input-0') as HTMLInputElement
      // Manually set value and trigger change event using fireEvent
      fireEvent.change(input, { target: { value: 'New description' } })

      expect(mockOnUpdate).toHaveBeenCalledWith(0, 'description', 'New description')
    })

    it('should have aria-label for accessibility', () => {
      render(<InputParameterItem {...defaultProps} />)
      expect(screen.getByLabelText('Parameter 1 description')).toBeInTheDocument()
    })

    it('should handle empty description', () => {
      const paramWithoutDesc = { ...defaultParam, description: undefined }
      render(
        <InputParameterItem
          {...defaultProps}
          param={paramWithoutDesc}
        />
      )
      const input = screen.getByTestId('param-description-input-0') as HTMLInputElement
      expect(input.value).toBe('')
    })
  })

  describe('Remove Button', () => {
    it('should render remove button', () => {
      render(<InputParameterItem {...defaultProps} />)
      expect(screen.getByTestId('remove-parameter-btn-0')).toBeInTheDocument()
    })

    it('should have trash icon in button', () => {
      const { container } = render(<InputParameterItem {...defaultProps} />)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should call onRemove when clicked', async () => {
      const user = userEvent.setup()
      render(<InputParameterItem {...defaultProps} />)

      const removeButton = screen.getByTestId('remove-parameter-btn-0')
      await user.click(removeButton)

      expect(mockOnRemove).toHaveBeenCalledWith(0)
    })

    it('should have aria-label for accessibility', () => {
      render(<InputParameterItem {...defaultProps} />)
      const button = screen.getByTestId('remove-parameter-btn-0')
      expect(button).toHaveAttribute('aria-label', 'Remove parameter 1')
    })

    it('should have destructive color styling', () => {
      const { container } = render(<InputParameterItem {...defaultProps} />)
      const button = container.querySelector('[data-testid="remove-parameter-btn-0"]')
      expect(button?.className).toContain('destructive')
    })
  })

  describe('Type-Based Placeholder', () => {
    const types = [
      { type: 'string', expected: '"Hello World"' },
      { type: 'number', expected: '42' },
      { type: 'boolean', expected: 'true' },
      { type: 'array', expected: '["item1", "item2"]' },
      { type: 'object', expected: '{"key": "value"}' },
    ]

    types.forEach(({ type, expected }) => {
      it(`should show correct placeholder for ${type} type`, () => {
        const param = { ...defaultParam, type: type as any }
        render(
          <InputParameterItem
            {...defaultProps}
            param={param}
          />
        )
        const input = screen.getByTestId('param-default-input-0')
        expect(input).toHaveAttribute('placeholder', expected)
      })
    })
  })

  describe('Index Handling', () => {
    it('should use correct index in testids', () => {
      render(
        <InputParameterItem
          {...defaultProps}
          index={2}
        />
      )
      expect(screen.getByTestId('param-name-input-2')).toBeInTheDocument()
      expect(screen.getByTestId('param-type-select-2')).toBeInTheDocument()
      expect(screen.getByTestId('param-default-input-2')).toBeInTheDocument()
      expect(screen.getByTestId('param-description-input-2')).toBeInTheDocument()
      expect(screen.getByTestId('remove-parameter-btn-2')).toBeInTheDocument()
    })

    it('should pass correct index to callbacks', async () => {
      render(
        <InputParameterItem
          {...defaultProps}
          index={3}
        />
      )

      const input = screen.getByTestId('param-name-input-3') as HTMLInputElement
      // Manually set value and trigger change event using fireEvent
      fireEvent.change(input, { target: { value: 'test' } })

      expect(mockOnUpdate).toHaveBeenCalledWith(3, 'name', 'test')
    })

    it('should update aria-label with correct index', () => {
      render(
        <InputParameterItem
          {...defaultProps}
          index={2}
        />
      )
      const button = screen.getByTestId('remove-parameter-btn-2')
      expect(button).toHaveAttribute('aria-label', 'Remove parameter 3')
    })
  })

  describe('Component Structure', () => {
    it('should have proper grid layout for name and type', () => {
      const { container } = render(<InputParameterItem {...defaultProps} />)
      const grid = container.querySelector('[class*="grid"]')
      expect(grid?.className).toContain('grid-cols-2')
    })

    it('should have space between fields', () => {
      const { container } = render(<InputParameterItem {...defaultProps} />)
      const cardContent = container.querySelector('div[class*="space-y"]')
      expect(cardContent).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      render(<InputParameterItem {...defaultProps} />)
      expect(screen.getByLabelText('Parameter 1 name')).toBeInTheDocument()
      expect(screen.getByLabelText('Parameter 1 type')).toBeInTheDocument()
      expect(screen.getByLabelText('Parameter 1 default value')).toBeInTheDocument()
      expect(screen.getByLabelText('Parameter 1 description')).toBeInTheDocument()
    })

    it('should have meaningful button aria-labels', () => {
      render(<InputParameterItem {...defaultProps} />)
      const button = screen.getByTestId('remove-parameter-btn-0')
      expect(button).toHaveAttribute('aria-label')
    })

    it('should have aria-hidden for decorative icons', () => {
      const { container } = render(<InputParameterItem {...defaultProps} />)
      const icons = container.querySelectorAll('[aria-hidden="true"]')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Error States', () => {
    it('should handle all parameter types', () => {
      const types = ['string', 'number', 'boolean', 'array', 'object']
      types.forEach(type => {
        const { unmount } = render(
          <InputParameterItem
            {...defaultProps}
            param={{ ...defaultParam, type: type as any }}
          />
        )
        expect(screen.getByTestId('param-name-input-0')).toBeInTheDocument()
        unmount()
      })
    })

    it('should handle missing description gracefully', () => {
      const param = { ...defaultParam, description: undefined }
      expect(() => {
        render(
          <InputParameterItem
            {...defaultProps}
            param={param}
          />
        )
      }).not.toThrow()
    })
  })
})
