import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DynamicFormField } from './DynamicFormField';

const makeField = (overrides = {}) => ({
  name: 'test_field',
  type: 'text' as any,
  label: 'Test Label',
  required: false,
  placeholder: 'Enter value',
  ...overrides,
});

const baseProps = {
  value: '',
  error: undefined,
  onChange: vi.fn(),
  onBlur: vi.fn(),
};

describe('DynamicFormField', () => {
  it('should render a text field for type=text', () => {
    render(
      <DynamicFormField
        field={makeField({ type: 'text', label: 'Full Name' })}
        {...baseProps}
      />,
    );
    expect(screen.getAllByText('Full Name').length).toBeGreaterThan(0);
  });

  it('should render a text field for type=email', () => {
    render(
      <DynamicFormField
        field={makeField({ type: 'email', label: 'Email' })}
        {...baseProps}
      />,
    );
    expect(screen.getAllByText('Email').length).toBeGreaterThan(0);
  });

  it('should render a number field for type=number', () => {
    const { container } = render(
      <DynamicFormField
        field={makeField({ type: 'number', label: 'Age' })}
        {...baseProps}
        value={null}
      />,
    );
    expect(container.querySelector('input[type="number"]')).not.toBeNull();
  });

  it('should render a textarea for type=textarea', () => {
    const { container } = render(
      <DynamicFormField
        field={makeField({ type: 'textarea', label: 'Description' })}
        {...baseProps}
      />,
    );
    expect(container.querySelector('textarea')).not.toBeNull();
  });

  it('should render a select for type=select', () => {
    const { container } = render(
      <DynamicFormField
        field={makeField({
          type: 'select',
          label: 'Status',
          options: [{ value: 'active', label: 'Active' }],
        })}
        {...baseProps}
      />,
    );
    expect(container.querySelector('[role="combobox"]')).not.toBeNull();
  });

  it('should render a checkbox for type=checkbox', () => {
    const { container } = render(
      <DynamicFormField
        field={makeField({ type: 'checkbox', label: 'Subscribe' })}
        {...baseProps}
        value={false}
      />,
    );
    expect(
      container.querySelector('input[type="checkbox"]'),
    ).not.toBeNull();
  });

  it('should render a date input for type=date', () => {
    const { container } = render(
      <DynamicFormField
        field={makeField({ type: 'date', label: 'Birthdate' })}
        {...baseProps}
      />,
    );
    expect(container.querySelector('input[type="date"]')).not.toBeNull();
  });

  it('should render a datetime-local input for type=datetime', () => {
    const { container } = render(
      <DynamicFormField
        field={makeField({ type: 'datetime', label: 'Scheduled At' })}
        {...baseProps}
      />,
    );
    expect(
      container.querySelector('input[type="datetime-local"]'),
    ).not.toBeNull();
  });

  it('should call onChange when typing in textarea', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <DynamicFormField
        field={makeField({ type: 'textarea', label: 'Notes' })}
        value=""
        error={undefined}
        onChange={onChange}
      />,
    );
    const ta = container.querySelector('textarea');
    expect(ta).not.toBeNull();
    await user.type(ta!, 'hello notes');
    expect(onChange).toHaveBeenCalled();
  });

  it('should call onChange when typing in date field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <DynamicFormField
        field={makeField({ type: 'date', label: 'Date' })}
        value=""
        error={undefined}
        onChange={onChange}
      />,
    );
    const input = container.querySelector('input[type="date"]');
    expect(input).not.toBeNull();
    await user.type(input!, '2024-01-15');
    expect(onChange).toHaveBeenCalled();
  });

  it('should call onChange when typing in datetime field', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <DynamicFormField
        field={makeField({ type: 'datetime', label: 'DateTime' })}
        value=""
        error={undefined}
        onChange={onChange}
      />,
    );
    const input = container.querySelector('input[type="datetime-local"]');
    expect(input).not.toBeNull();
    await user.type(input!, '2024-01-15T10:00');
    expect(onChange).toHaveBeenCalled();
  });

  it('should return null and warn for unknown field type', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(
      <DynamicFormField
        field={makeField({ type: 'unknown_type', label: 'Unknown' })}
        {...baseProps}
      />,
    );
    expect(container.firstChild).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Unknown field type'),
    );
    warnSpy.mockRestore();
  });
});
