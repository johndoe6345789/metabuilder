import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button (atom)', () => {
  it('should render without crashing', () => {
    const { container } = render(<Button>Click me</Button>);
    expect(container).toBeDefined();
  });

  it('should render text via children', () => {
    render(<Button>Submit</Button>);
    expect(screen.getAllByText('Submit').length).toBeGreaterThan(0);
  });

  it('should render text via text prop', () => {
    render(<Button text="Save" />);
    expect(screen.getAllByText('Save').length).toBeGreaterThan(0);
  });

  it('should prefer text prop over children when both provided', () => {
    render(<Button text="Text Prop">Children Text</Button>);
    // text || children: text takes priority
    expect(screen.getAllByText('Text Prop').length).toBeGreaterThan(0);
  });

  it('should render with startIcon when provided', () => {
    const { container } = render(
      <Button startIcon="Add">Add Item</Button>,
    );
    // Should have an SVG icon
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('should render with endIcon when provided', () => {
    const { container } = render(
      <Button endIcon="Delete">Remove</Button>,
    );
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(<Button onClick={onClick}>Click</Button>);
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    await user.click(btn!);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const btn = container.querySelector('button[disabled]');
    expect(btn).not.toBeNull();
  });
});
