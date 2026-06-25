import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TextField from './TextField';

describe('TextField (atom)', () => {
  it('should render without crashing', () => {
    const { container } = render(<TextField />);
    expect(container).toBeDefined();
  });

  it('should render a label when provided', () => {
    render(<TextField label="Email Address" />);
    expect(screen.getAllByText('Email Address').length).toBeGreaterThan(0);
  });

  it('should render an input element', () => {
    const { container } = render(<TextField />);
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('should call onChange when user types', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <TextField onChange={onChange} />,
    );
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
    await user.type(input!, 'hello');
    expect(onChange).toHaveBeenCalled();
  });

  it('should show the value when controlled', () => {
    const { container } = render(
      <TextField value="test value" onChange={vi.fn()} />,
    );
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
    expect((input as HTMLInputElement).value).toBe('test value');
  });

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(<TextField disabled />);
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
    expect((input as HTMLInputElement).disabled).toBe(true);
  });
});
