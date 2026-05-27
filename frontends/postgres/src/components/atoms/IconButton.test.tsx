import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IconButton from './IconButton';

describe('IconButton (atom)', () => {
  it('should render without crashing', () => {
    const { container } = render(<IconButton icon="Delete" />);
    expect(container).toBeDefined();
  });

  it('should render an SVG icon', () => {
    const { container } = render(<IconButton icon="Add" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('should render a button element', () => {
    const { container } = render(<IconButton icon="Edit" />);
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <IconButton icon="Delete" onClick={onClick} />,
    );
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    await user.click(btn!);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should return null and warn for unknown icon', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(
      <IconButton icon={'NonExistentIcon_xyz' as any} />,
    );
    expect(container.querySelector('button')).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('NonExistentIcon_xyz'),
    );
    warnSpy.mockRestore();
  });

  it('should be disabled when disabled prop is true', () => {
    const { container } = render(<IconButton icon="Delete" disabled />);
    const btn = container.querySelector('button[disabled]');
    expect(btn).not.toBeNull();
  });
});
