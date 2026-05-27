import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  TextLikeField,
  NumberField,
  SelectField,
  CheckboxField,
  baseTextProps,
} from './DynamicFormFieldBase';
import type { FieldProps } from './DynamicFormFieldBase';

const makeField = (overrides = {}) => ({
  name: 'test_field',
  type: 'text' as const,
  label: 'Test Label',
  required: false,
  placeholder: 'Enter value',
  ...overrides,
});

describe('DynamicFormFieldBase', () => {
  describe('baseTextProps', () => {
    it('should return correct props without error', () => {
      const field = makeField();
      const props = baseTextProps(field, undefined);
      expect(props.fullWidth).toBe(true);
      expect(props.error).toBe(false);
      expect(props.helperText).toBeUndefined();
    });

    it('should return error props when error is provided', () => {
      const field = makeField();
      const props = baseTextProps(field, 'Required');
      expect(props.error).toBe(true);
      expect(props.helperText).toBe('Required');
    });

    it('should set disabled when provided', () => {
      const field = makeField();
      const props = baseTextProps(field, undefined, true);
      expect(props.disabled).toBe(true);
    });
  });

  describe('TextLikeField', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <TextLikeField
          field={makeField()}
          value=""
          error={undefined}
          onChange={vi.fn()}
        />,
      );
      expect(container).toBeDefined();
    });

    it('should show the field label', () => {
      render(
        <TextLikeField
          field={makeField({ label: 'Username' })}
          value=""
          error={undefined}
          onChange={vi.fn()}
        />,
      );
      expect(screen.getAllByText('Username').length).toBeGreaterThan(0);
    });

    it('should show an error message when error is provided', () => {
      render(
        <TextLikeField
          field={makeField()}
          value=""
          error="This field is required"
          onChange={vi.fn()}
        />,
      );
      expect(
        screen.getAllByText('This field is required').length,
      ).toBeGreaterThan(0);
    });

    it('should call onChange when user types', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(
        <TextLikeField
          field={makeField()}
          value=""
          error={undefined}
          onChange={onChange}
        />,
      );
      const input = container.querySelector('input');
      expect(input).not.toBeNull();
      await user.type(input!, 'hello');
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('NumberField', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <NumberField
          field={makeField({ type: 'number', label: 'Age' })}
          value={null}
          error={undefined}
          onChange={vi.fn()}
        />,
      );
      expect(container).toBeDefined();
    });

    it('should render a number input', () => {
      const { container } = render(
        <NumberField
          field={makeField({ type: 'number', label: 'Quantity' })}
          value={42}
          error={undefined}
          onChange={vi.fn()}
        />,
      );
      const input = container.querySelector('input[type="number"]');
      expect(input).not.toBeNull();
    });
  });

  describe('SelectField', () => {
    const selectField = makeField({
      type: 'select',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    });

    it('should render without crashing', () => {
      const { container } = render(
        <SelectField
          field={selectField}
          value=""
          error={undefined}
          onChange={vi.fn()}
        />,
      );
      expect(container).toBeDefined();
    });

    it('should show the field label', () => {
      render(
        <SelectField
          field={selectField}
          value=""
          error={undefined}
          onChange={vi.fn()}
        />,
      );
      expect(screen.getAllByText('Status').length).toBeGreaterThan(0);
    });

    it('should show error message when error provided', () => {
      render(
        <SelectField
          field={selectField}
          value=""
          error="Select is required"
          onChange={vi.fn()}
        />,
      );
      expect(
        screen.getAllByText('Select is required').length,
      ).toBeGreaterThan(0);
    });
  });

  describe('CheckboxField', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <CheckboxField
          field={makeField({ type: 'checkbox', label: 'Agree to terms' })}
          value={false}
          error={undefined}
          onChange={vi.fn()}
        />,
      );
      expect(container).toBeDefined();
    });

    it('should render the label', () => {
      render(
        <CheckboxField
          field={makeField({ type: 'checkbox', label: 'Subscribe' })}
          value={false}
          error={undefined}
          onChange={vi.fn()}
        />,
      );
      expect(screen.getAllByText('Subscribe').length).toBeGreaterThan(0);
    });

    it('should call onChange when checked', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(
        <CheckboxField
          field={makeField({ type: 'checkbox', label: 'Check me' })}
          value={false}
          error={undefined}
          onChange={onChange}
        />,
      );
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).not.toBeNull();
      await user.click(checkbox!);
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it('should show error when error is provided', () => {
      render(
        <CheckboxField
          field={makeField({ type: 'checkbox', label: 'Required checkbox' })}
          value={false}
          error="Must be checked"
          onChange={vi.fn()}
        />,
      );
      expect(screen.getAllByText('Must be checked').length).toBeGreaterThan(0);
    });
  });
});
