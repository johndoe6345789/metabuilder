/**
 * Tests for WorkflowCardResizeHandles component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import WorkflowCardResizeHandles from '../WorkflowCardResizeHandles';

describe('WorkflowCardResizeHandles', () => {
  it('renders 8 resize handles', () => {
    const onResizeStart = jest.fn();
    const { container } = render(<WorkflowCardResizeHandles onResizeStart={onResizeStart} />);
    // 8 handles with data-no-drag attribute
    const handles = container.querySelectorAll('[data-no-drag]');
    expect(handles).toHaveLength(8);
  });

  it('calls onResizeStart with correct direction for each handle', () => {
    const onResizeStart = jest.fn();
    const { container } = render(<WorkflowCardResizeHandles onResizeStart={onResizeStart} />);
    const handles = Array.from(container.querySelectorAll('[data-no-drag]'));

    // Fire mousedown on each handle
    handles.forEach((handle) => {
      fireEvent.mouseDown(handle);
    });
    expect(onResizeStart).toHaveBeenCalledTimes(8);
  });

  it('passes the mouse event to onResizeStart', () => {
    const onResizeStart = jest.fn();
    const { container } = render(<WorkflowCardResizeHandles onResizeStart={onResizeStart} />);
    const firstHandle = container.querySelectorAll('[data-no-drag]')[0];
    fireEvent.mouseDown(firstHandle);
    expect(onResizeStart).toHaveBeenCalledWith(expect.anything(), expect.any(String));
  });

  const directions = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

  it.each(directions)('passes direction "%s" to onResizeStart', (dir) => {
    const onResizeStart = jest.fn();
    const { container } = render(<WorkflowCardResizeHandles onResizeStart={onResizeStart} />);
    const handles = Array.from(container.querySelectorAll('[data-no-drag]'));
    handles.forEach((h) => fireEvent.mouseDown(h));
    const calledDirections = onResizeStart.mock.calls.map((c) => c[1]);
    expect(calledDirections).toContain(dir);
  });
});
