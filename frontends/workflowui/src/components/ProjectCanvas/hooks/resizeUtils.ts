/**
 * resizeUtils - Direction-based resize calculation helpers
 */

const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

interface Size {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

interface ResizeResult {
  newW: number;
  newH: number;
  newX: number;
  newY: number;
}

export function applyResizeDirection(
  direction: string,
  delta: Position,
  size: Size,
  position: Position
): ResizeResult {
  let newW = size.width;
  let newH = size.height;
  let newX = position.x;
  let newY = position.y;

  if (direction.includes('e'))
    newW = Math.max(MIN_WIDTH, size.width + delta.x);
  if (direction.includes('s'))
    newH = Math.max(MIN_HEIGHT, size.height + delta.y);
  if (direction.includes('w')) {
    const dw = -delta.x;
    newW = Math.max(MIN_WIDTH, size.width + dw);
    if (newW > MIN_WIDTH) newX = position.x - dw;
  }
  if (direction.includes('n')) {
    const dh = -delta.y;
    newH = Math.max(MIN_HEIGHT, size.height + dh);
    if (newH > MIN_HEIGHT) newY = position.y - dh;
  }

  return { newW, newH, newX, newY };
}
