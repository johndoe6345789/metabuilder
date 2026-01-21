/**
 * Unit tests for component tree renderer
 */
import { describe, it, expect, vi } from 'vitest';
import { renderComponentNode } from './componentTreeRenderer';
import type { ComponentNode } from './featureConfig';

describe('componentTreeRenderer', () => {
  it('should render a simple Box component', () => {
    const node: ComponentNode = {
      component: 'Box',
      props: {
        sx: { p: 2 },
      },
    };

    const context = { data: {}, actions: {}, state: {} };
    const result = renderComponentNode(node, context);

    expect(result).toBeTruthy();
  });

  it('should render Typography with text prop', () => {
    const node: ComponentNode = {
      component: 'Typography',
      props: {
        variant: 'h5',
        text: 'Hello World',
      },
    };

    const context = { data: {}, actions: {}, state: {} };
    const result = renderComponentNode(node, context);

    expect(result).toBeTruthy();
    expect((result as any)?.props?.variant).toBe('h5');
  });

  it('should interpolate template variables', () => {
    const node: ComponentNode = {
      component: 'Typography',
      props: {
        text: '{{data.message}}',
      },
    };

    const context = {
      data: { message: 'Test Message' },
      actions: {},
      state: {},
    };

    const result = renderComponentNode(node, context);
    expect(result).toBeTruthy();
  });

  it('should handle condition and not render when false', () => {
    const node: ComponentNode = {
      component: 'Box',
      condition: 'data.show',
      props: {
        sx: { p: 2 },
      },
    };

    const context = {
      data: { show: false },
      actions: {},
      state: {},
    };

    const result = renderComponentNode(node, context);
    expect(result).toBeNull();
  });

  it('should handle condition and render when true', () => {
    const node: ComponentNode = {
      component: 'Box',
      condition: 'data.show',
      props: {
        sx: { p: 2 },
      },
    };

    const context = {
      data: { show: true },
      actions: {},
      state: {},
    };

    const result = renderComponentNode(node, context);
    expect(result).toBeTruthy();
  });

  it('should map onClick to action function', () => {
    const mockAction = vi.fn();
    const node: ComponentNode = {
      component: 'Button',
      props: {
        text: 'Click Me',
        onClick: 'handleClick',
      },
    };

    const context = {
      data: {},
      actions: { handleClick: mockAction },
      state: {},
    };

    const result = renderComponentNode(node, context);
    expect(result).toBeTruthy();
    expect((result as any)?.props?.onClick).toBe(mockAction);
  });
});
