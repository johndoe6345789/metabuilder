/**
 * Tests for resizeUtils - applyResizeDirection pure function
 */

import { applyResizeDirection } from '../resizeUtils';

const BASE_SIZE = { width: 300, height: 200 };
const BASE_POS = { x: 100, y: 150 };
const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

describe('applyResizeDirection', () => {
  // East: widen to the right
  it('e: increases width by delta.x', () => {
    const result = applyResizeDirection('e', { x: 50, y: 0 }, BASE_SIZE, BASE_POS);
    expect(result.newW).toBe(350);
    expect(result.newH).toBe(200);
    expect(result.newX).toBe(100);
    expect(result.newY).toBe(150);
  });

  it('e: clamps width to MIN_WIDTH when shrinking past minimum', () => {
    const result = applyResizeDirection('e', { x: -200, y: 0 }, BASE_SIZE, BASE_POS);
    expect(result.newW).toBe(MIN_WIDTH);
  });

  // South: taller downward
  it('s: increases height by delta.y', () => {
    const result = applyResizeDirection('s', { x: 0, y: 30 }, BASE_SIZE, BASE_POS);
    expect(result.newH).toBe(230);
    expect(result.newW).toBe(300);
    expect(result.newX).toBe(100);
    expect(result.newY).toBe(150);
  });

  it('s: clamps height to MIN_HEIGHT', () => {
    const result = applyResizeDirection('s', { x: 0, y: -200 }, BASE_SIZE, BASE_POS);
    expect(result.newH).toBe(MIN_HEIGHT);
  });

  // West: widen to the left (moves position)
  it('w: increases width and moves x left', () => {
    const result = applyResizeDirection('w', { x: -50, y: 0 }, BASE_SIZE, BASE_POS);
    expect(result.newW).toBe(350);
    expect(result.newX).toBe(50); // position moved left
  });

  it('w: clamps to MIN_WIDTH and does not move x when at min', () => {
    // delta.x = +200 means dw = -200, newW would be 100 < MIN_WIDTH
    const result = applyResizeDirection('w', { x: 200, y: 0 }, BASE_SIZE, BASE_POS);
    expect(result.newW).toBe(MIN_WIDTH);
    expect(result.newX).toBe(100); // position unchanged at minimum
  });

  // North: taller upward (moves position)
  it('n: increases height and moves y up', () => {
    const result = applyResizeDirection('n', { x: 0, y: -40 }, BASE_SIZE, BASE_POS);
    expect(result.newH).toBe(240);
    expect(result.newY).toBe(110); // moved up
  });

  it('n: clamps to MIN_HEIGHT and does not move y when at min', () => {
    // delta.y = +100 means dh = -100, newH would be 100 < MIN_HEIGHT
    const result = applyResizeDirection('n', { x: 0, y: 100 }, BASE_SIZE, BASE_POS);
    expect(result.newH).toBe(MIN_HEIGHT);
    expect(result.newY).toBe(150); // position unchanged
  });

  // Diagonal: ne
  it('ne: changes both width (right) and height (up)', () => {
    const result = applyResizeDirection('ne', { x: 20, y: -10 }, BASE_SIZE, BASE_POS);
    expect(result.newW).toBe(320);
    expect(result.newH).toBe(210);
    expect(result.newX).toBe(100); // east doesn't move x
    expect(result.newY).toBe(140); // north moves y up
  });

  // Diagonal: sw
  it('sw: changes both width (left) and height (down)', () => {
    const result = applyResizeDirection('sw', { x: -30, y: 15 }, BASE_SIZE, BASE_POS);
    expect(result.newW).toBe(330);
    expect(result.newH).toBe(215);
    expect(result.newX).toBe(70); // west moves x left
    expect(result.newY).toBe(150); // south doesn't move y
  });

  // Diagonal: se
  it('se: increases width right and height down', () => {
    const result = applyResizeDirection('se', { x: 10, y: 10 }, BASE_SIZE, BASE_POS);
    expect(result.newW).toBe(310);
    expect(result.newH).toBe(210);
  });

  // Diagonal: nw
  it('nw: increases width left and height up', () => {
    const result = applyResizeDirection('nw', { x: -10, y: -10 }, BASE_SIZE, BASE_POS);
    expect(result.newW).toBe(310);
    expect(result.newH).toBe(210);
    expect(result.newX).toBe(90);
    expect(result.newY).toBe(140);
  });

  // No-op direction
  it('unknown direction: returns original values unchanged', () => {
    const result = applyResizeDirection('', { x: 100, y: 100 }, BASE_SIZE, BASE_POS);
    expect(result).toEqual({ newW: 300, newH: 200, newX: 100, newY: 150 });
  });
});
