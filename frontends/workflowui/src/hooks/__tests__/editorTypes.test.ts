/**
 * Tests for editorTypes - TypeScript interface declarations
 * These are type-only exports; we test they exist and can be used as types.
 */

import type { UseEditorReturn } from '../editorTypes';

describe('editorTypes', () => {
  it('UseEditorReturn interface can be used as a type annotation', () => {
    // This is a compile-time test; if the type is invalid, TypeScript will fail.
    const mockReturn: Partial<UseEditorReturn> = {
      zoom: 1,
      pan: { x: 0, y: 0 },
      selectedNodes: new Set<string>(),
      selectedEdges: new Set<string>(),
      isDrawing: false,
    };
    expect(mockReturn.zoom).toBe(1);
    expect(mockReturn.pan).toEqual({ x: 0, y: 0 });
  });

  it('UseEditorReturn has expected function properties', () => {
    const mockReturn: Partial<UseEditorReturn> = {
      zoomIn: jest.fn(),
      zoomOut: jest.fn(),
      resetZoom: jest.fn(),
      clearSelection: jest.fn(),
    };
    expect(typeof mockReturn.zoomIn).toBe('function');
    expect(typeof mockReturn.zoomOut).toBe('function');
    expect(typeof mockReturn.resetZoom).toBe('function');
    expect(typeof mockReturn.clearSelection).toBe('function');
  });
});
