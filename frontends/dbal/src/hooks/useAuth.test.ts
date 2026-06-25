import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock queryUtils to control localStorage
vi.mock('../queryUtils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../queryUtils')>()
  return {
    ...actual,
    loadToken: vi.fn(() => ''),
    saveToken: vi.fn(),
    removeToken: vi.fn(),
  }
})

import { useAuth } from './useAuth'
import * as queryUtils from '../queryUtils'

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(queryUtils.loadToken as ReturnType<typeof vi.fn>).mockReturnValue('')
  })

  describe('initial state', () => {
    it('starts unauthenticated when no token saved', () => {
      const { result } = renderHook(() => useAuth())
      expect(result.current.authed).toBe(false)
      expect(result.current.token).toBe('')
      expect(result.current.tokenInput).toBe('')
    })

    it('auto-logs in when a token is already saved', () => {
      ;(queryUtils.loadToken as ReturnType<typeof vi.fn>).mockReturnValue('saved-token')
      const { result } = renderHook(() => useAuth())
      expect(result.current.authed).toBe(true)
      expect(result.current.token).toBe('saved-token')
    })
  })

  describe('setTokenInput', () => {
    it('updates tokenInput state', () => {
      const { result } = renderHook(() => useAuth())
      act(() => result.current.setTokenInput('my-token'))
      expect(result.current.tokenInput).toBe('my-token')
    })
  })

  describe('handleLogin', () => {
    it('sets token and authed=true from tokenInput', () => {
      const { result } = renderHook(() => useAuth())
      act(() => result.current.setTokenInput('new-token'))
      act(() => result.current.handleLogin())
      expect(result.current.token).toBe('new-token')
      expect(result.current.authed).toBe(true)
      expect(queryUtils.saveToken).toHaveBeenCalledWith('new-token')
    })

    it('trims whitespace from tokenInput', () => {
      const { result } = renderHook(() => useAuth())
      // setTokenInput must be committed to state before handleLogin reads it
      act(() => result.current.setTokenInput('  trimmed  '))
      act(() => result.current.handleLogin())
      expect(result.current.token).toBe('trimmed')
    })

    it('uses defaultToken when tokenInput is empty', () => {
      const { result } = renderHook(() => useAuth())
      act(() => result.current.handleLogin())
      // The default token is non-empty (from queryConsole.json)
      expect(result.current.token.length).toBeGreaterThan(0)
      expect(result.current.authed).toBe(true)
    })
  })

  describe('handleLogout', () => {
    it('clears token and sets authed=false', () => {
      ;(queryUtils.loadToken as ReturnType<typeof vi.fn>).mockReturnValue('existing-token')
      const { result } = renderHook(() => useAuth())
      act(() => result.current.handleLogout())
      expect(result.current.token).toBe('')
      expect(result.current.authed).toBe(false)
      expect(queryUtils.removeToken).toHaveBeenCalled()
    })
  })
})
