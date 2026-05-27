import { describe, expect, it, vi } from 'vitest'

vi.mock('@/store/middleware/dbalSync', () => ({
  syncToDBAL: vi.fn().mockResolvedValue(undefined),
  deleteFromDBAL: vi.fn().mockResolvedValue(undefined),
}))

import reducer, {
  setCurrentTheme,
  updateThemeColors,
  updateThemeTypography,
  addTheme,
  deleteTheme,
  setThemes,
  type Theme,
  type ThemeColors,
  type ThemeTypography,
} from './themeSlice'

function makeTheme(id: string, name = `Theme ${id}`): Theme {
  return {
    id,
    name,
    colors: {
      primary: '#000',
      secondary: '#111',
      accent: '#222',
      background: '#fff',
      foreground: '#333',
      muted: '#aaa',
      destructive: '#f00',
      border: '#ccc',
    },
    typography: {
      fontFamily: 'Roboto',
      headingFamily: 'Georgia',
      fontSize: { base: '16px' },
      fontWeight: { normal: 400 },
    },
    spacing: { unit: 4, scale: [4, 8, 16] },
    updatedAt: Date.now(),
  }
}

describe('themeSlice reducer', () => {
  const empty = { currentTheme: null, themes: [], loading: false, error: null }

  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(empty)
  })

  describe('setCurrentTheme', () => {
    it('sets the current theme', () => {
      const state = reducer(empty, setCurrentTheme(makeTheme('1')))
      expect(state.currentTheme?.id).toBe('1')
    })
  })

  describe('updateThemeColors', () => {
    it('merges partial colors into current theme', () => {
      let state = reducer(empty, setCurrentTheme(makeTheme('1')))
      state = reducer(state, updateThemeColors({ primary: '#blue' }))
      expect(state.currentTheme?.colors.primary).toBe('#blue')
      expect(state.currentTheme?.colors.secondary).toBe('#111')
    })

    it('updates updatedAt timestamp', () => {
      const before = Date.now()
      let state = reducer(empty, setCurrentTheme(makeTheme('1')))
      state = reducer(state, updateThemeColors({ primary: '#red' }))
      expect(state.currentTheme!.updatedAt).toBeGreaterThanOrEqual(before)
    })

    it('is a no-op when no currentTheme', () => {
      const state = reducer(empty, updateThemeColors({ primary: '#red' }))
      expect(state.currentTheme).toBeNull()
    })
  })

  describe('updateThemeTypography', () => {
    it('merges partial typography into current theme', () => {
      let state = reducer(empty, setCurrentTheme(makeTheme('1')))
      state = reducer(state, updateThemeTypography({ fontFamily: 'Inter' }))
      expect(state.currentTheme?.typography.fontFamily).toBe('Inter')
      expect(state.currentTheme?.typography.headingFamily).toBe('Georgia')
    })

    it('is a no-op when no currentTheme', () => {
      const state = reducer(empty, updateThemeTypography({ fontFamily: 'Inter' }))
      expect(state.currentTheme).toBeNull()
    })
  })

  describe('addTheme', () => {
    it('appends a theme to the themes list', () => {
      const state = reducer(empty, addTheme(makeTheme('1')))
      expect(state.themes).toHaveLength(1)
      expect(state.themes[0].id).toBe('1')
    })
  })

  describe('deleteTheme', () => {
    it('removes a theme from the list', () => {
      let state = reducer(empty, addTheme(makeTheme('1')))
      state = reducer(state, addTheme(makeTheme('2')))
      state = reducer(state, deleteTheme('1'))
      expect(state.themes.map(t => t.id)).toEqual(['2'])
    })

    it('clears currentTheme when the deleted theme is active', () => {
      let state = reducer(empty, setCurrentTheme(makeTheme('1')))
      state = reducer(state, deleteTheme('1'))
      expect(state.currentTheme).toBeNull()
    })

    it('does not clear currentTheme when a different theme is deleted', () => {
      let state = reducer(empty, setCurrentTheme(makeTheme('1')))
      state = reducer(state, addTheme(makeTheme('2')))
      state = reducer(state, deleteTheme('2'))
      expect(state.currentTheme?.id).toBe('1')
    })
  })

  describe('setThemes', () => {
    it('replaces all themes', () => {
      let state = reducer(empty, addTheme(makeTheme('old')))
      state = reducer(state, setThemes([makeTheme('a'), makeTheme('b')]))
      expect(state.themes).toHaveLength(2)
      expect(state.themes[0].id).toBe('a')
    })
  })
})
