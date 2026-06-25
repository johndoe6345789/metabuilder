/**
 * Unit tests for component tree renderer
 */
import { describe, it, expect, vi } from 'vitest';
import ComponentTreeRendererDefault, { renderComponentNode, ComponentTreeRenderer } from './componentTreeRenderer';
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

  it('should return null and warn for unknown component', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const node: ComponentNode = {
      component: 'NonExistentXYZWidget',
      props: {},
    };
    const context = { data: {}, actions: {}, state: {} };
    const result = renderComponentNode(node, context);
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('NonExistentXYZWidget'),
    );
    warnSpy.mockRestore();
  });

  it('should render children array when node.children is set', () => {
    const node: ComponentNode = {
      component: 'Box',
      props: {},
      children: [
        { component: 'Typography', props: { text: 'Child 1' } },
        { component: 'Typography', props: { text: 'Child 2' } },
      ],
    };
    const context = { data: {}, actions: {}, state: {} };
    const result = renderComponentNode(node, context, 'test');
    expect(result).toBeTruthy();
  });

  it('should handle forEach that returns non-array and warn', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const node: ComponentNode = {
      component: 'Box',
      props: {},
      forEach: 'data.notAnArray',
    };
    const context = { data: { notAnArray: 'just a string' }, actions: {}, state: {} };
    const result = renderComponentNode(node, context);
    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('not an array'),
    );
    warnSpy.mockRestore();
  });

  it('should handle forEach with an array and render multiple items', () => {
    const node: ComponentNode = {
      component: 'Typography',
      props: { text: '{{data.item.name}}' },
      forEach: 'data.items',
    };
    const context = {
      data: { items: [{ name: 'Alice' }, { name: 'Bob' }] },
      actions: {},
      state: {},
    };
    const result = renderComponentNode(node, context, 'root');
    expect(result).toBeTruthy();
  });

  it('should render Icon component when component is Icon', () => {
    const node: ComponentNode = {
      component: 'Icon',
      props: { name: 'Add' },
    };
    const context = { data: {}, actions: {}, state: {} };
    // resolveIcon may return null for unknown icon — just check it doesn't throw
    expect(() => renderComponentNode(node, context)).not.toThrow();
  });
});

describe('ComponentTreeRenderer', () => {
  it('should render using renderComponentNode', () => {
    const tree: ComponentNode = {
      component: 'Box',
      props: { sx: { p: 1 } },
    };
    const context = { data: {}, actions: {}, state: {} };
    const result = ComponentTreeRenderer({ tree, context });
    expect(result).toBeTruthy();
  });
});

describe('ComponentTreeRendererDefault', () => {
  it('should render with default data and handlers', () => {
    const tree: ComponentNode = {
      component: 'Box',
      props: {},
    };
    const result = ComponentTreeRendererDefault({ tree });
    expect(result).toBeTruthy();
  });

  it('should render with provided data and handlers', () => {
    const tree: ComponentNode = {
      component: 'Typography',
      props: { text: '{{data.title}}' },
    };
    const result = ComponentTreeRendererDefault({
      tree,
      data: { title: 'Test' },
      handlers: { onClick: vi.fn() },
    });
    expect(result).toBeTruthy();
  });
});
