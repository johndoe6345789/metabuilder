/**
 * Tests for lib/flow.ts – Bezier path utilities
 */

import { getBezierPath, Position } from '../flow';

describe('getBezierPath', () => {
  it('returns a tuple of [pathString, centerX, centerY]', () => {
    const result = getBezierPath({
      sourceX: 0,
      sourceY: 0,
      sourcePosition: Position.Right,
      targetX: 200,
      targetY: 0,
      targetPosition: Position.Left,
    });
    expect(result).toHaveLength(3);
    const [path, cx, cy] = result;
    expect(typeof path).toBe('string');
    expect(typeof cx).toBe('number');
    expect(typeof cy).toBe('number');
  });

  it('starts the SVG path at the source coordinates', () => {
    const [path] = getBezierPath({
      sourceX: 10,
      sourceY: 20,
      sourcePosition: Position.Right,
      targetX: 100,
      targetY: 80,
      targetPosition: Position.Left,
    });
    expect(path.startsWith('M10,20')).toBe(true);
  });

  it('ends the SVG path at the target coordinates', () => {
    const [path] = getBezierPath({
      sourceX: 0,
      sourceY: 0,
      sourcePosition: Position.Bottom,
      targetX: 50,
      targetY: 100,
      targetPosition: Position.Top,
    });
    expect(path).toMatch(/50,100$/);
  });

  it('computes center as midpoint of source and target', () => {
    const [, cx, cy] = getBezierPath({
      sourceX: 0,
      sourceY: 0,
      sourcePosition: Position.Right,
      targetX: 200,
      targetY: 100,
      targetPosition: Position.Left,
    });
    expect(cx).toBe(100);
    expect(cy).toBe(50);
  });

  it('generates a cubic bezier (C command)', () => {
    const [path] = getBezierPath({
      sourceX: 0,
      sourceY: 0,
      sourcePosition: Position.Right,
      targetX: 300,
      targetY: 0,
      targetPosition: Position.Left,
    });
    expect(path).toContain('C');
  });

  it('respects custom curvature', () => {
    const [pathDefault] = getBezierPath({
      sourceX: 0,
      sourceY: 0,
      sourcePosition: Position.Right,
      targetX: 200,
      targetY: 0,
      targetPosition: Position.Left,
      curvature: 0.25,
    });
    const [pathHigh] = getBezierPath({
      sourceX: 0,
      sourceY: 0,
      sourcePosition: Position.Right,
      targetX: 200,
      targetY: 0,
      targetPosition: Position.Left,
      curvature: 0.75,
    });
    // Different curvature → different control points
    expect(pathDefault).not.toBe(pathHigh);
  });

  it('handles all four source positions', () => {
    const positions = [
      Position.Top,
      Position.Bottom,
      Position.Left,
      Position.Right,
    ];
    positions.forEach((pos) => {
      const [path] = getBezierPath({
        sourceX: 0,
        sourceY: 0,
        sourcePosition: pos,
        targetX: 100,
        targetY: 100,
        targetPosition: Position.Left,
      });
      expect(typeof path).toBe('string');
      expect(path.length).toBeGreaterThan(0);
    });
  });

  it('works when source and target are at the same position', () => {
    const result = getBezierPath({
      sourceX: 50,
      sourceY: 50,
      sourcePosition: Position.Right,
      targetX: 50,
      targetY: 50,
      targetPosition: Position.Left,
    });
    expect(result).toHaveLength(3);
  });

  it('uses minimum offset of 100 for short distances', () => {
    // Distance < 100 → offsetFactor = max(dist, 100) = 100
    const [path] = getBezierPath({
      sourceX: 0,
      sourceY: 0,
      sourcePosition: Position.Right,
      targetX: 10,
      targetY: 0,
      targetPosition: Position.Left,
      curvature: 1.0,
    });
    // Control X from source side: 0 + 1*100 = 100
    expect(path).toContain('100,0');
  });
});

describe('Position enum', () => {
  it('has the four expected values', () => {
    expect(Position.Top).toBe('top');
    expect(Position.Bottom).toBe('bottom');
    expect(Position.Left).toBe('left');
    expect(Position.Right).toBe('right');
  });
});
