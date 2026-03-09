/**
 * Tests for Auto-Layout Algorithms
 */

import {
  gridLayout,
  horizontalFlowLayout,
  verticalFlowLayout,
  forceDirectedLayout,
  applyLayout,
  LayoutAlgorithm,
} from '../autoLayout'
import { ProjectCanvasItem } from '../../types/project'

// Mock canvas items for testing
const createMockItems = (count: number): ProjectCanvasItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    type: 'workflow' as const,
    workflowId: `workflow-${i}`,
    position: { x: 0, y: 0 },
    metadata: {
      name: `Workflow ${i}`,
      description: `Test workflow ${i}`,
    },
  }))
}

describe('Auto-Layout Algorithms', () => {
  describe('gridLayout', () => {
    it('should arrange items in a grid with default options', () => {
      const items = createMockItems(6)
      const result = gridLayout(items)

      expect(result).toHaveLength(6)
      expect(result[0].position).toBeDefined()
    })

    it('should arrange items in specified number of columns', () => {
      const items = createMockItems(6)
      const result = gridLayout(items, { columns: 2, centerOnCanvas: false })

      expect(result).toHaveLength(6)
      // First item (column 0, row 0)
      expect(result[0].position).toEqual({ x: 0, y: 0 })
      // Second item (column 1, row 0)
      expect(result[1].position?.x).toBeGreaterThan(0)
      // Third item (column 0, row 1)
      expect(result[2].position?.x).toBe(0)
      expect(result[2].position?.y).toBeGreaterThan(0)
    })

    it('should respect custom spacing', () => {
      const items = createMockItems(2)
      const spacing = 100
      const itemWidth = 300
      const result = gridLayout(items, { spacing, itemWidth, centerOnCanvas: false })

      const expectedX = itemWidth + spacing
      expect(result[1].position?.x).toBe(expectedX)
    })

    it('should center items on canvas when requested', () => {
      const items = createMockItems(3)
      const result = gridLayout(items, { centerOnCanvas: true, columns: 3 })

      // When centered, some positions should be negative
      const hasNegativeX = result.some(r => r.position && r.position.x < 0)
      const hasNegativeY = result.some(r => r.position && r.position.y < 0)
      expect(hasNegativeX || hasNegativeY).toBe(true)
    })

    it('should handle empty array', () => {
      const result = gridLayout([])
      expect(result).toHaveLength(0)
    })

    it('should handle single item', () => {
      const items = createMockItems(1)
      const result = gridLayout(items, { centerOnCanvas: false })

      expect(result).toHaveLength(1)
      expect(result[0].position).toEqual({ x: 0, y: 0 })
    })
  })

  describe('horizontalFlowLayout', () => {
    it('should arrange items horizontally', () => {
      const items = createMockItems(4)
      const result = horizontalFlowLayout(items)

      expect(result).toHaveLength(4)
      // All items should have y = 0
      result.forEach((item) => {
        expect(item.position?.y).toBe(0)
      })
      // X coordinates should increase
      expect(result[0].position?.x).toBe(0)
      expect(result[1].position?.x).toBeGreaterThan(0)
      expect(result[2].position?.x).toBeGreaterThan(result[1].position?.x ?? 0)
    })

    it('should respect custom spacing', () => {
      const items = createMockItems(3)
      const spacing = 50
      const itemWidth = 200
      const result = horizontalFlowLayout(items, { spacing, itemWidth })

      const expectedSpacing = itemWidth + spacing
      expect(result[1].position?.x).toBe(expectedSpacing)
      expect(result[2].position?.x).toBe(expectedSpacing * 2)
    })

    it('should handle empty array', () => {
      const result = horizontalFlowLayout([])
      expect(result).toHaveLength(0)
    })
  })

  describe('verticalFlowLayout', () => {
    it('should arrange items vertically', () => {
      const items = createMockItems(4)
      const result = verticalFlowLayout(items)

      expect(result).toHaveLength(4)
      // All items should have x = 0
      result.forEach((item) => {
        expect(item.position?.x).toBe(0)
      })
      // Y coordinates should increase
      expect(result[0].position?.y).toBe(0)
      expect(result[1].position?.y).toBeGreaterThan(0)
      expect(result[2].position?.y).toBeGreaterThan(result[1].position?.y ?? 0)
    })

    it('should respect custom spacing', () => {
      const items = createMockItems(3)
      const spacing = 50
      const itemHeight = 200
      const result = verticalFlowLayout(items, { spacing, itemHeight })

      const expectedSpacing = itemHeight + spacing
      expect(result[1].position?.y).toBe(expectedSpacing)
      expect(result[2].position?.y).toBe(expectedSpacing * 2)
    })

    it('should handle empty array', () => {
      const result = verticalFlowLayout([])
      expect(result).toHaveLength(0)
    })
  })

  describe('forceDirectedLayout', () => {
    it('should create positions for all items', () => {
      const items = createMockItems(5)
      const result = forceDirectedLayout(items)

      expect(result).toHaveLength(5)
      result.forEach((item) => {
        expect(item.position).toBeDefined()
        expect(typeof item.position?.x).toBe('number')
        expect(typeof item.position?.y).toBe('number')
      })
    })

    it('should separate items to avoid overlap', () => {
      const items = createMockItems(3)
      const result = forceDirectedLayout(items, { itemWidth: 100, itemHeight: 100, spacing: 50 })

      // Calculate distances between all pairs
      for (let i = 0; i < result.length; i++) {
        for (let j = i + 1; j < result.length; j++) {
          const dx = (result[j].position?.x ?? 0) - (result[i].position?.x ?? 0)
          const dy = (result[j].position?.y ?? 0) - (result[i].position?.y ?? 0)
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Items should be separated by at least some distance
          expect(distance).toBeGreaterThan(0)
        }
      }
    })

    it('should return integer positions', () => {
      const items = createMockItems(4)
      const result = forceDirectedLayout(items)

      result.forEach((item) => {
        expect(Number.isInteger(item.position?.x)).toBe(true)
        expect(Number.isInteger(item.position?.y)).toBe(true)
      })
    })

    it('should handle single item', () => {
      const items = createMockItems(1)
      const result = forceDirectedLayout(items)

      expect(result).toHaveLength(1)
      expect(result[0].position).toBeDefined()
    })

    it('should handle empty array', () => {
      const result = forceDirectedLayout([])
      expect(result).toHaveLength(0)
    })
  })

  describe('applyLayout', () => {
    const items = createMockItems(4)

    it('should apply grid layout by default', () => {
      const result = applyLayout(items)
      const gridResult = gridLayout(items)

      expect(result).toHaveLength(gridResult.length)
    })

    it('should apply grid layout when specified', () => {
      const result = applyLayout(items, 'grid')
      expect(result).toHaveLength(4)
    })

    it('should apply horizontal flow layout', () => {
      const result = applyLayout(items, 'horizontal-flow')
      expect(result).toHaveLength(4)
      // All items should have y = 0 for horizontal flow
      result.forEach((item) => {
        expect(item.position?.y).toBe(0)
      })
    })

    it('should apply vertical flow layout', () => {
      const result = applyLayout(items, 'vertical-flow')
      expect(result).toHaveLength(4)
      // All items should have x = 0 for vertical flow
      result.forEach((item) => {
        expect(item.position?.x).toBe(0)
      })
    })

    it('should apply force-directed layout', () => {
      const result = applyLayout(items, 'force-directed')
      expect(result).toHaveLength(4)
    })

    it('should pass options to layout algorithms', () => {
      const result = applyLayout(items, 'grid', { columns: 2, spacing: 100 })
      expect(result).toHaveLength(4)
    })

    it('should handle invalid algorithm by defaulting to grid', () => {
      const result = applyLayout(items, 'invalid-algorithm' as LayoutAlgorithm)
      const gridResult = gridLayout(items)
      expect(result).toHaveLength(gridResult.length)
    })
  })

  describe('Layout Algorithm Integration', () => {
    it('should produce consistent IDs across all algorithms', () => {
      const items = createMockItems(5)

      const gridResult = gridLayout(items)
      const horizontalResult = horizontalFlowLayout(items)
      const verticalResult = verticalFlowLayout(items)
      const forceResult = forceDirectedLayout(items)

      const ids = items.map(item => item.id)

      expect(gridResult.map(r => r.id)).toEqual(ids)
      expect(horizontalResult.map(r => r.id)).toEqual(ids)
      expect(verticalResult.map(r => r.id)).toEqual(ids)
      expect(forceResult.map(r => r.id)).toEqual(ids)
    })

    it('should handle large number of items', () => {
      const items = createMockItems(100)
      const result = gridLayout(items, { columns: 10 })

      expect(result).toHaveLength(100)
      result.forEach((item) => {
        expect(item.position).toBeDefined()
      })
    })
  })
})
