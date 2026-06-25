/**
 * Tests for useTemplatesPage hook
 */

jest.mock('@metabuilder/services', () => ({
  templateService: {
    getAllTemplates: jest.fn(),
    getCategories: jest.fn(),
    getStats: jest.fn(),
    searchTemplates: jest.fn(),
  },
}))

import { renderHook, act } from '@testing-library/react'
import { useTemplatesPage } from '../useTemplatesPage'
import { templateService } from '@metabuilder/services'

const mockTemplates = [
  { id: 't1', name: 'Web Scraper', description: 'Scrape websites', category: 'automation', difficulty: 'beginner', tags: [], downloads: 100, rating: 4.5, nodes: [], connections: {} },
  { id: 't2', name: 'Data Pipeline', description: 'Process data', category: 'data', difficulty: 'intermediate', tags: [], downloads: 200, rating: 4.0, nodes: [], connections: {} },
  { id: 't3', name: 'API Integration', description: 'Connect APIs', category: 'automation', difficulty: 'advanced', tags: [], downloads: 50, rating: 3.5, nodes: [], connections: {} },
]

const mockCategories = [
  { id: 'all', name: 'All Templates', count: 3 },
  { id: 'automation', name: 'Automation', count: 2 },
  { id: 'data', name: 'Data', count: 1 },
]

const mockStats = {
  totalTemplates: 3,
  totalDownloads: 350,
  averageRating: 4.0,
}

function setupMocks() {
  ;(templateService.getAllTemplates as jest.Mock).mockReturnValue(mockTemplates)
  ;(templateService.getCategories as jest.Mock).mockReturnValue(mockCategories)
  ;(templateService.getStats as jest.Mock).mockReturnValue(mockStats)
  ;(templateService.searchTemplates as jest.Mock).mockReturnValue(mockTemplates)
}

describe('useTemplatesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
  })

  it('should initialize with empty search query', () => {
    const { result } = renderHook(() => useTemplatesPage())
    expect(result.current.searchQuery).toBe('')
  })

  it('should initialize with selectedCategory = "all"', () => {
    const { result } = renderHook(() => useTemplatesPage())
    expect(result.current.selectedCategory).toBe('all')
  })

  it('should initialize with selectedDifficulty = "all"', () => {
    const { result } = renderHook(() => useTemplatesPage())
    expect(result.current.selectedDifficulty).toBe('all')
  })

  it('should initialize with viewMode = "grid"', () => {
    const { result } = renderHook(() => useTemplatesPage())
    expect(result.current.viewMode).toBe('grid')
  })

  it('should return allTemplates from service', () => {
    const { result } = renderHook(() => useTemplatesPage())
    expect(result.current.allTemplates).toEqual(mockTemplates)
  })

  it('should return categories from service', () => {
    const { result } = renderHook(() => useTemplatesPage())
    expect(result.current.categories).toEqual(mockCategories)
  })

  it('should return stats from service', () => {
    const { result } = renderHook(() => useTemplatesPage())
    expect(result.current.stats).toEqual(mockStats)
  })

  it('should update searchQuery', () => {
    const { result } = renderHook(() => useTemplatesPage())

    act(() => { result.current.setSearchQuery('pipeline') })

    expect(result.current.searchQuery).toBe('pipeline')
  })

  it('should update selectedCategory', () => {
    const { result } = renderHook(() => useTemplatesPage())

    act(() => { result.current.setSelectedCategory('automation' as any) })

    expect(result.current.selectedCategory).toBe('automation')
  })

  it('should update selectedDifficulty', () => {
    const { result } = renderHook(() => useTemplatesPage())

    act(() => { result.current.setSelectedDifficulty('beginner') })

    expect(result.current.selectedDifficulty).toBe('beginner')
  })

  it('should update viewMode', () => {
    const { result } = renderHook(() => useTemplatesPage())

    act(() => { result.current.setViewMode('list') })

    expect(result.current.viewMode).toBe('list')
  })

  it('should call searchTemplates with search query filter', () => {
    ;(templateService.searchTemplates as jest.Mock).mockReturnValue([mockTemplates[0]])

    const { result } = renderHook(() => useTemplatesPage())

    act(() => { result.current.setSearchQuery('scraper') })

    expect(templateService.searchTemplates).toHaveBeenCalledWith(
      expect.objectContaining({ searchQuery: 'scraper' })
    )
  })

  it('should not pass searchQuery when empty', () => {
    const { result } = renderHook(() => useTemplatesPage())

    // searchQuery is empty, should not include it in filters
    expect(templateService.searchTemplates).toHaveBeenCalledWith(
      expect.objectContaining({ searchQuery: undefined })
    )
  })

  it('should filter by category when not "all"', () => {
    const { result } = renderHook(() => useTemplatesPage())

    act(() => { result.current.setSelectedCategory('automation' as any) })

    expect(templateService.searchTemplates).toHaveBeenCalledWith(
      expect.objectContaining({ category: 'automation' })
    )
  })

  it('should filter by difficulty when not "all"', () => {
    const { result } = renderHook(() => useTemplatesPage())

    act(() => { result.current.setSelectedDifficulty('beginner') })

    expect(templateService.searchTemplates).toHaveBeenCalledWith(
      expect.objectContaining({ difficulty: 'beginner' })
    )
  })

  it('resetFilters should reset all filters', () => {
    const { result } = renderHook(() => useTemplatesPage())

    act(() => {
      result.current.setSearchQuery('something')
      result.current.setSelectedCategory('automation' as any)
      result.current.setSelectedDifficulty('advanced')
    })

    act(() => { result.current.resetFilters() })

    expect(result.current.searchQuery).toBe('')
    expect(result.current.selectedCategory).toBe('all')
    expect(result.current.selectedDifficulty).toBe('all')
  })
})
