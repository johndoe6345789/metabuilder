/**
 * Tests for pure editor hooks (useDrawingConnection and useEditorKeyboard only)
 */

import { renderHook, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';

import { useDrawingConnection } from '../useDrawingConnection';
import { useEditorKeyboard } from '../useEditorKeyboard';

// ── useDrawingConnection ──────────────────────────────────────────────────────
describe('useDrawingConnection', () => {
  it('initializes drawingConnection as null', () => {
    const { result } = renderHook(() => useDrawingConnection());
    expect(result.current.drawingConnection).toBeNull();
  });

  it('setDrawingConnection sets a connection', () => {
    const { result } = renderHook(() => useDrawingConnection());
    const conn = {
      sourceNodeId: 'node-1',
      sourceOutput: 'output0',
      startPosition: { x: 100, y: 200 },
      currentPosition: { x: 100, y: 200 },
    };
    act(() => {
      result.current.setDrawingConnection(conn);
    });
    expect(result.current.drawingConnection).toEqual(conn);
  });

  it('setDrawingConnection sets null', () => {
    const { result } = renderHook(() => useDrawingConnection());
    act(() => {
      result.current.setDrawingConnection({
        sourceNodeId: 'n1',
        sourceOutput: 'out',
        startPosition: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
      });
    });
    act(() => {
      result.current.setDrawingConnection(null);
    });
    expect(result.current.drawingConnection).toBeNull();
  });
});

// ── useEditorKeyboard ─────────────────────────────────────────────────────────
describe('useEditorKeyboard', () => {
  const setup = (params = {}) => {
    const mockParams = {
      selectedNodeId: 'node-1',
      setSelectedNodeId: jest.fn(),
      setDrawingConnection: jest.fn(),
      setPropertiesDialogOpen: jest.fn(),
      handleDeleteNode: jest.fn(),
      ...params,
    };
    const { unmount } = renderHook(() => useEditorKeyboard(mockParams));
    return { mockParams, unmount };
  };

  it('calls handleDeleteNode when Delete key is pressed with selectedNodeId', () => {
    const { mockParams, unmount } = setup();
    act(() => {
      fireEvent.keyDown(window, { key: 'Delete' });
    });
    expect(mockParams.handleDeleteNode).toHaveBeenCalledWith('node-1');
    unmount();
  });

  it('calls handleDeleteNode when Backspace key is pressed', () => {
    const { mockParams, unmount } = setup();
    act(() => {
      fireEvent.keyDown(window, { key: 'Backspace' });
    });
    expect(mockParams.handleDeleteNode).toHaveBeenCalledWith('node-1');
    unmount();
  });

  it('does not delete when no selectedNodeId', () => {
    const { mockParams, unmount } = setup({ selectedNodeId: null });
    act(() => {
      fireEvent.keyDown(window, { key: 'Delete' });
    });
    expect(mockParams.handleDeleteNode).not.toHaveBeenCalled();
    unmount();
  });

  it('calls setSelectedNodeId and setDrawingConnection on Escape', () => {
    const { mockParams, unmount } = setup();
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    expect(mockParams.setSelectedNodeId).toHaveBeenCalledWith(null);
    expect(mockParams.setDrawingConnection).toHaveBeenCalledWith(null);
    expect(mockParams.setPropertiesDialogOpen).toHaveBeenCalledWith(false);
    unmount();
  });
});

