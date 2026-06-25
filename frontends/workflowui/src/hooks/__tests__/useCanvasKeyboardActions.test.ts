/**
 * Tests for useCanvasKeyboardActions hook
 */

const mockDispatch = jest.fn();
const mockUseSelector = jest.fn();
const mockUseCanvasKeyboard = jest.fn();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: any) => mockUseSelector(selector),
}));

jest.mock('@metabuilder/redux-slices', () => ({
  deleteCanvasItems: jest.fn((ids: string[]) => ({ type: 'deleteCanvasItems', payload: ids })),
  duplicateCanvasItems: jest.fn((ids: string[]) => ({ type: 'duplicateCanvasItems', payload: ids })),
  selectCanvasItems: jest.fn(() => []),
  selectSelectedItemIds: jest.fn(() => new Set<string>()),
  setSelection: jest.fn((ids: Set<string>) => ({ type: 'setSelection', payload: ids })),
}));

jest.mock('../useCanvasKeyboard', () => ({
  useCanvasKeyboard: (opts: any) => mockUseCanvasKeyboard(opts),
}));

import { renderHook, act } from '@testing-library/react';
import { useCanvasKeyboardActions } from '../useCanvasKeyboardActions';
import {
  deleteCanvasItems,
  duplicateCanvasItems,
  setSelection,
} from '@metabuilder/redux-slices';

describe('useCanvasKeyboardActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: empty selection and empty canvas items
    mockUseSelector.mockImplementation((selector: any) => {
      // Detect which selector is being called
      const selFn = selector.toString();
      if (selFn.includes('selectSelectedItemIds') || selFn.length < 100) {
        // Return based on call order
        const callCount = mockUseSelector.mock.calls.length;
        if (callCount <= 1) return new Set<string>();
        return [];
      }
      return [];
    });
  });

  it('registers keyboard shortcuts with useCanvasKeyboard', () => {
    mockUseSelector
      .mockReturnValueOnce(new Set<string>()) // selectedItemIds
      .mockReturnValueOnce([]); // canvasItems

    renderHook(() => useCanvasKeyboardActions());
    expect(mockUseCanvasKeyboard).toHaveBeenCalledWith(
      expect.objectContaining({
        onSelectAll: expect.any(Function),
        onDeleteSelected: expect.any(Function),
        onDuplicateSelected: expect.any(Function),
        onSearch: expect.any(Function),
      })
    );
  });

  it('handleSelectAll dispatches setSelection with all item ids', () => {
    const items = [{ id: 'i1' }, { id: 'i2' }, { id: 'i3' }];
    mockUseSelector
      .mockReturnValueOnce(new Set<string>()) // selectedItemIds
      .mockReturnValueOnce(items); // canvasItems

    renderHook(() => useCanvasKeyboardActions());

    // Get the onSelectAll handler
    const { onSelectAll } = mockUseCanvasKeyboard.mock.calls[0][0];
    act(() => { onSelectAll(); });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'setSelection' })
    );
  });

  it('handleDeleteSelected dispatches deleteCanvasItems when items selected', () => {
    const selectedIds = new Set(['id-1', 'id-2']);
    mockUseSelector
      .mockReturnValueOnce(selectedIds) // selectedItemIds
      .mockReturnValueOnce([]); // canvasItems

    renderHook(() => useCanvasKeyboardActions());

    const { onDeleteSelected } = mockUseCanvasKeyboard.mock.calls[0][0];
    act(() => { onDeleteSelected(); });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'deleteCanvasItems' })
    );
  });

  it('handleDeleteSelected does not dispatch when nothing selected', () => {
    mockUseSelector
      .mockReturnValueOnce(new Set<string>()) // empty selection
      .mockReturnValueOnce([]);

    renderHook(() => useCanvasKeyboardActions());

    const { onDeleteSelected } = mockUseCanvasKeyboard.mock.calls[0][0];
    act(() => { onDeleteSelected(); });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('handleDuplicateSelected dispatches duplicateCanvasItems when items selected', () => {
    const selectedIds = new Set(['id-1']);
    mockUseSelector
      .mockReturnValueOnce(selectedIds)
      .mockReturnValueOnce([]);

    renderHook(() => useCanvasKeyboardActions());

    const { onDuplicateSelected } = mockUseCanvasKeyboard.mock.calls[0][0];
    act(() => { onDuplicateSelected(); });

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'duplicateCanvasItems' })
    );
  });

  it('handleDuplicateSelected does not dispatch when nothing selected', () => {
    mockUseSelector
      .mockReturnValueOnce(new Set<string>())
      .mockReturnValueOnce([]);

    renderHook(() => useCanvasKeyboardActions());

    const { onDuplicateSelected } = mockUseCanvasKeyboard.mock.calls[0][0];
    act(() => { onDuplicateSelected(); });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('handleSearch logs a message (Phase 4 placeholder)', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockUseSelector
      .mockReturnValueOnce(new Set<string>())
      .mockReturnValueOnce([]);

    renderHook(() => useCanvasKeyboardActions());

    const { onSearch } = mockUseCanvasKeyboard.mock.calls[0][0];
    act(() => { onSearch(); });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Search'));
    consoleSpy.mockRestore();
  });
});
