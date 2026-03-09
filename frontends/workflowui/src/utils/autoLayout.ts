/**
 * Auto-Layout Algorithms for Workflow Canvas
 * Automatically arrange workflow cards on the canvas
 */

import { ProjectCanvasItem, CanvasPosition } from '../types/project';

export type LayoutAlgorithm = 'grid' | 'horizontal-flow' | 'vertical-flow' | 'force-directed';

interface LayoutOptions {
  itemWidth?: number;
  itemHeight?: number;
  spacing?: number;
  columns?: number;
  rows?: number;
  centerOnCanvas?: boolean;
}

/**
 * Grid layout - arrange items in rows and columns
 */
export function gridLayout(
  items: ProjectCanvasItem[],
  options: LayoutOptions = {}
): Partial<ProjectCanvasItem>[] {
  const { itemWidth = 300, itemHeight = 200, spacing = 40, columns = 3, centerOnCanvas = true } = options;

  const updates: Partial<ProjectCanvasItem>[] = [];
  let row = 0;
  let col = 0;

  items.forEach((item, index) => {
    const x = col * (itemWidth + spacing);
    const y = row * (itemHeight + spacing);

    updates.push({
      id: item.id,
      position: { x, y }
    });

    col++;
    if (col >= columns) {
      col = 0;
      row++;
    }
  });

  // Center on canvas if requested
  if (centerOnCanvas && updates.length > 0) {
    const maxX = (columns - 1) * (itemWidth + spacing);
    const maxY = Math.ceil(items.length / columns) * (itemHeight + spacing);
    const offsetX = -(maxX / 2);
    const offsetY = -(maxY / 2);

    updates.forEach((update) => {
      if (update.position) {
        update.position.x += offsetX;
        update.position.y += offsetY;
      }
    });
  }

  return updates;
}

/**
 * Horizontal flow - arrange items left to right
 */
export function horizontalFlowLayout(
  items: ProjectCanvasItem[],
  options: LayoutOptions = {}
): Partial<ProjectCanvasItem>[] {
  const { itemWidth = 300, itemHeight = 200, spacing = 40 } = options;

  return items.map((item, index) => ({
    id: item.id,
    position: { x: index * (itemWidth + spacing), y: 0 }
  }));
}

/**
 * Vertical flow - arrange items top to bottom
 */
export function verticalFlowLayout(
  items: ProjectCanvasItem[],
  options: LayoutOptions = {}
): Partial<ProjectCanvasItem>[] {
  const { itemWidth = 300, itemHeight = 200, spacing = 40 } = options;

  return items.map((item, index) => ({
    id: item.id,
    position: { x: 0, y: index * (itemHeight + spacing) }
  }));
}

/**
 * Force-directed layout - physics-based arrangement
 * Items push away from each other to minimize overlaps
 */
export function forceDirectedLayout(
  items: ProjectCanvasItem[],
  options: LayoutOptions = {}
): Partial<ProjectCanvasItem>[] {
  const { itemWidth = 300, itemHeight = 200, spacing = 40 } = options;
  const repulsionForce = spacing * 2;
  const iterations = 10;
  const damping = 0.8;

  // Initialize positions randomly
  const positions = items.map((item) => ({
    id: item.id,
    x: (Math.random() - 0.5) * 1000,
    y: (Math.random() - 0.5) * 1000,
    vx: 0,
    vy: 0
  }));

  // Simulate forces for N iterations
  for (let iter = 0; iter < iterations; iter++) {
    // Reset velocities
    positions.forEach((p) => {
      p.vx = 0;
      p.vy = 0;
    });

    // Calculate repulsive forces
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[j].x - positions[i].x;
        const dy = positions[j].y - positions[i].y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const minDistance = itemWidth + itemHeight + repulsionForce;

        if (distance < minDistance) {
          const force = (minDistance - distance) / distance;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          positions[i].vx -= fx;
          positions[i].vy -= fy;
          positions[j].vx += fx;
          positions[j].vy += fy;
        }
      }
    }

    // Apply gravity to center (gentle pull to origin)
    positions.forEach((p) => {
      const gravitationStrength = 0.01;
      p.vx -= p.x * gravitationStrength;
      p.vy -= p.y * gravitationStrength;
    });

    // Update positions
    positions.forEach((p) => {
      p.x += p.vx * damping;
      p.y += p.vy * damping;
    });
  }

  return positions.map((p) => ({
    id: p.id,
    position: { x: Math.round(p.x), y: Math.round(p.y) }
  }));
}

/**
 * Apply layout algorithm to canvas items
 */
export function applyLayout(
  items: ProjectCanvasItem[],
  algorithm: LayoutAlgorithm = 'grid',
  options: LayoutOptions = {}
): Partial<ProjectCanvasItem>[] {
  switch (algorithm) {
    case 'grid':
      return gridLayout(items, options);
    case 'horizontal-flow':
      return horizontalFlowLayout(items, options);
    case 'vertical-flow':
      return verticalFlowLayout(items, options);
    case 'force-directed':
      return forceDirectedLayout(items, options);
    default:
      return gridLayout(items, options);
  }
}

export default {
  gridLayout,
  horizontalFlowLayout,
  verticalFlowLayout,
  forceDirectedLayout,
  applyLayout
};
