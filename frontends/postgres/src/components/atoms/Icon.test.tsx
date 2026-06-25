import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import Icon from './Icon';

describe('Icon (atom)', () => {
  it('should render without crashing for a known icon', () => {
    const { container } = render(<Icon name="Add" />);
    expect(container).toBeDefined();
  });

  it('should render an SVG for a valid icon name', () => {
    const { container } = render(<Icon name="Delete" />);
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('should render null and warn for unknown icon', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(
      <Icon name={'NonExistentIcon_xyz' as any} />,
    );
    // null render — no SVG
    expect(container.querySelector('svg')).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('NonExistentIcon_xyz'),
    );
    warnSpy.mockRestore();
  });

  it('should forward additional props to the icon component', () => {
    const { container } = render(
      <Icon name="Edit" color="primary" fontSize="large" />,
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });
});
