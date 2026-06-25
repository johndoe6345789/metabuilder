/**
 * useCanvasVirtualization Hook
 * Renders only visible canvas items based on viewport and zoom level
 * Improves performance for 100+ workflow cards
 *
 * Migrated from workflowui - generic implementation
 */

import { useMemo } from 'react';

interface CanvasItem {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  [key: string]: any;
}

interface ViewportBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface VirtualizationOptions {
  padding?: number; // Extra padding beyond viewport for preloading
  containerWidth?: number;
  containerHeight?: number;
}

export function useCanvasVirtualization<T extends CanvasItem>(
  items: T[],
  pan: { x: number; y: number },
  zoom: number,
  options: VirtualizationOptions = {}
) {
  const { padding = 100, containerWidth = 1200, containerHeight = 800 } = options;

  // Calculate viewport bounds
  const viewportBounds = useMemo(() => {
    const bounds: ViewportBounds = {
      minX: -pan.x / zoom - padding / zoom,
      maxX: -pan.x / zoom + containerWidth / zoom + padding / zoom,
      minY: -pan.y / zoom - padding / zoom,
      maxY: -pan.y / zoom + containerHeight / zoom + padding / zoom
    };
    return bounds;
  }, [pan, zoom, containerWidth, containerHeight, padding]);

  // Filter items that are within viewport bounds
  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const itemRight = item.position.x + item.size.width;
      const itemBottom = item.position.y + item.size.height;

      return !(
        itemRight < viewportBounds.minX ||
        item.position.x > viewportBounds.maxX ||
        itemBottom < viewportBounds.minY ||
        item.position.y > viewportBounds.maxY
      );
    });
  }, [items, viewportBounds]);

  // Calculate statistics for performance monitoring
  const stats = useMemo(() => {
    return {
      totalItems: items.length,
      visibleItems: visibleItems.length,
      hiddenItems: items.length - visibleItems.length,
      percentVisible: items.length > 0 ? Math.round((visibleItems.length / items.length) * 100) : 0
    };
  }, [items, visibleItems]);

  return {
    visibleItems,
    stats,
    viewportBounds
  };
}

export default useCanvasVirtualization;
