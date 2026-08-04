import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGuiQuery } from './useGuiQuery'

describe('useGuiQuery', () => {
  describe('initial state', () => {
    it('starts with GET method', () => {
      const { result } = renderHook(() => useGuiQuery())
      expect(result.current.method).toBe('GET')
    })

    it('starts with pastebin tenant and pkg', () => {
      const { result } = renderHook(() => useGuiQuery())
      expect(result.current.tenant).toBe('pastebin')
      expect(result.current.pkg).toBe('pastebin')
    })

    it('starts with Snippet entity', () => {
      const { result } = renderHook(() => useGuiQuery())
      expect(result.current.entity).toBe('Snippet')
    })

    it('starts with empty entityId, queryParams, body', () => {
      const { result } = renderHook(() => useGuiQuery())
      expect(result.current.entityId).toBe('')
      expect(result.current.queryParams).toBe('')
      expect(result.current.body).toBe('')
    })
  })

  describe('setters', () => {
    it('setMethod updates method', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => result.current.setMethod('POST'))
      expect(result.current.method).toBe('POST')
    })

    it('setTenant updates tenant', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => result.current.setTenant('acme'))
      expect(result.current.tenant).toBe('acme')
    })

    it('setPkg updates pkg', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => result.current.setPkg('forum'))
      expect(result.current.pkg).toBe('forum')
    })

    it('setEntity updates entity', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => result.current.setEntity('User'))
      expect(result.current.entity).toBe('User')
    })

    it('setEntityId updates entityId', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => result.current.setEntityId('abc-123'))
      expect(result.current.entityId).toBe('abc-123')
    })

    it('setQueryParams updates queryParams', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => result.current.setQueryParams('limit=10'))
      expect(result.current.queryParams).toBe('limit=10')
    })

    it('setBody updates body', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => result.current.setBody('{"name":"test"}'))
      expect(result.current.body).toBe('{"name":"test"}')
    })
  })

  describe('buildPath', () => {
    it('builds basic path without entityId', () => {
      const { result } = renderHook(() => useGuiQuery())
      expect(result.current.buildPath()).toBe('/pastebin/pastebin/Snippet')
    })

    it('includes entityId when set', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => result.current.setEntityId('123'))
      expect(result.current.buildPath()).toBe('/pastebin/pastebin/Snippet/123')
    })

    it('includes queryParams for GET', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => result.current.setQueryParams('limit=5'))
      expect(result.current.buildPath()).toBe('/pastebin/pastebin/Snippet?limit=5')
    })

    it('does not append queryParams for POST', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => {
        result.current.setMethod('POST')
        result.current.setQueryParams('limit=5')
      })
      expect(result.current.buildPath()).toBe('/pastebin/pastebin/Snippet')
    })

    it('trims whitespace from entityId', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => result.current.setEntityId('  abc  '))
      expect(result.current.buildPath()).toBe('/pastebin/pastebin/Snippet/abc')
    })

    it('uses custom tenant/pkg/entity', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => {
        result.current.setTenant('acme')
        result.current.setPkg('crm')
        result.current.setEntity('Contact')
      })
      expect(result.current.buildPath()).toBe('/acme/crm/Contact')
    })
  })

  describe('parseBody', () => {
    it('returns ok true with undefined for empty body', () => {
      const { result } = renderHook(() => useGuiQuery())
      expect(result.current.parseBody()).toEqual({ ok: true, value: undefined })
    })

    it('returns ok true with undefined for GET method with body', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => result.current.setBody('{"key":"val"}'))
      // method is GET, body is ignored
      expect(result.current.parseBody()).toEqual({ ok: true, value: undefined })
    })

    it('returns parsed JSON for POST method', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => {
        result.current.setMethod('POST')
        result.current.setBody('{"name":"Alice"}')
      })
      expect(result.current.parseBody()).toEqual({ ok: true, value: { name: 'Alice' } })
    })

    it('returns parsed JSON for PUT method', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => {
        result.current.setMethod('PUT')
        result.current.setBody('{"name":"Bob"}')
      })
      expect(result.current.parseBody()).toEqual({ ok: true, value: { name: 'Bob' } })
    })

    it('returns ok false for invalid JSON on POST', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => {
        result.current.setMethod('POST')
        result.current.setBody('{bad json}')
      })
      const result2 = result.current.parseBody()
      expect(result2.ok).toBe(false)
      if (result2.ok === false) expect(result2.err).toBeTruthy()
    })

    it('returns ok true with undefined when body is whitespace only', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => {
        result.current.setMethod('POST')
        result.current.setBody('   ')
      })
      expect(result.current.parseBody()).toEqual({ ok: true, value: undefined })
    })
  })

  describe('setGuiFromParts', () => {
    it('sets all fields from parts', () => {
      const { result } = renderHook(() => useGuiQuery())
      act(() => result.current.setGuiFromParts('DELETE', 'acme', 'crm', 'Contact', 'xyz'))
      expect(result.current.method).toBe('DELETE')
      expect(result.current.tenant).toBe('acme')
      expect(result.current.pkg).toBe('crm')
      expect(result.current.entity).toBe('Contact')
      expect(result.current.entityId).toBe('xyz')
    })
  })
})
