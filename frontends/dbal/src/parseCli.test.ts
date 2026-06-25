import { describe, it, expect } from 'vitest'
import { parseCli } from './parseCli'

describe('parseCli', () => {
  describe('invalid / unrecognized input', () => {
    it('returns null for empty string', () => {
      expect(parseCli('')).toBeNull()
    })

    it('returns null for a single word', () => {
      expect(parseCli('dbal')).toBeNull()
    })

    it('returns null when first token is not dbal', () => {
      expect(parseCli('curl ping')).toBeNull()
      expect(parseCli('rest ping')).toBeNull()
    })

    it('returns null for unknown subcommand', () => {
      expect(parseCli('dbal unknown')).toBeNull()
    })

    it('is case-insensitive for dbal keyword', () => {
      const result = parseCli('DBAL ping')
      expect(result).not.toBeNull()
      expect(result?.path).toBe('/health')
    })
  })

  describe('ping subcommand', () => {
    it('parses dbal ping', () => {
      const result = parseCli('dbal ping')
      expect(result).toEqual({ method: 'GET', path: '/health' })
    })

    it('ignores extra whitespace', () => {
      const result = parseCli('  dbal   ping  ')
      expect(result).toEqual({ method: 'GET', path: '/health' })
    })
  })

  describe('list subcommand', () => {
    it('lists with a specified entity', () => {
      const result = parseCli('dbal list Snippet')
      expect(result).toEqual({
        method: 'GET',
        path: '/pastebin/pastebin/Snippet',
      })
    })

    it('lists with no entity defaults to Snippet', () => {
      const result = parseCli('dbal list')
      expect(result?.path).toBe('/pastebin/pastebin/Snippet')
      expect(result?.method).toBe('GET')
    })

    it('lists a different entity', () => {
      const result = parseCli('dbal list User')
      expect(result?.path).toBe('/pastebin/pastebin/User')
    })
  })

  describe('read subcommand', () => {
    it('reads an entity by id', () => {
      const result = parseCli('dbal read Snippet abc123')
      expect(result).toEqual({
        method: 'GET',
        path: '/pastebin/pastebin/Snippet/abc123',
      })
    })

    it('reads with no id appends empty string', () => {
      const result = parseCli('dbal read Snippet')
      expect(result?.path).toBe('/pastebin/pastebin/Snippet/')
      expect(result?.method).toBe('GET')
    })
  })

  describe('create subcommand', () => {
    it('creates with key-value body', () => {
      const result = parseCli('dbal create Snippet title="Hello" content="world"')
      expect(result?.method).toBe('POST')
      expect(result?.path).toBe('/pastebin/pastebin/Snippet')
      expect(result?.body).toEqual({ title: 'Hello', content: 'world' })
    })

    it('coerces numeric values', () => {
      const result = parseCli('dbal create Snippet count=5')
      expect(result?.body).toEqual({ count: 5 })
    })

    it('coerces boolean values', () => {
      const result = parseCli('dbal create Snippet active=true visible=false')
      expect(result?.body).toEqual({ active: true, visible: false })
    })

    it('creates with no body', () => {
      const result = parseCli('dbal create Snippet')
      expect(result?.method).toBe('POST')
      expect(result?.body).toEqual({})
    })
  })

  describe('update subcommand', () => {
    it('updates entity by id with body', () => {
      const result = parseCli('dbal update Snippet abc123 title="New"')
      expect(result?.method).toBe('PUT')
      expect(result?.path).toBe('/pastebin/pastebin/Snippet/abc123')
      expect(result?.body).toEqual({ title: 'New' })
    })

    it('updates with no body', () => {
      const result = parseCli('dbal update Snippet abc123')
      expect(result?.method).toBe('PUT')
      expect(result?.body).toEqual({})
    })
  })

  describe('delete subcommand', () => {
    it('deletes entity by id', () => {
      const result = parseCli('dbal delete Snippet abc123')
      expect(result).toEqual({
        method: 'DELETE',
        path: '/pastebin/pastebin/Snippet/abc123',
      })
    })

    it('deletes with no id', () => {
      const result = parseCli('dbal delete Snippet')
      expect(result?.method).toBe('DELETE')
      expect(result?.path).toBe('/pastebin/pastebin/Snippet/')
    })
  })

  describe('rest subcommand', () => {
    it('returns null for rest with fewer than 5 parts', () => {
      expect(parseCli('dbal rest tenant')).toBeNull()
      expect(parseCli('dbal rest tenant pkg')).toBeNull()
    })

    it('parses basic rest GET (default)', () => {
      const result = parseCli('dbal rest pastebin pastebin Snippet')
      expect(result).toEqual({
        method: 'GET',
        path: '/pastebin/pastebin/Snippet',
        body: undefined,
      })
    })

    it('parses rest with an id', () => {
      const result = parseCli('dbal rest pastebin pastebin Snippet abc123')
      expect(result?.path).toBe('/pastebin/pastebin/Snippet/abc123')
    })

    it('parses rest with explicit POST method', () => {
      const result = parseCli('dbal rest pastebin pastebin Snippet POST name=foo')
      expect(result?.method).toBe('POST')
      expect(result?.body).toEqual({ name: 'foo' })
    })

    it('parses rest with explicit DELETE method', () => {
      const result = parseCli('dbal rest pastebin pastebin Snippet DELETE')
      expect(result?.method).toBe('DELETE')
    })

    it('parses rest with explicit PUT method and body', () => {
      const result = parseCli('dbal rest pastebin pastebin Snippet PUT title=new')
      expect(result?.method).toBe('PUT')
      expect(result?.body).toEqual({ title: 'new' })
    })

    it('returns undefined body when no key-value pairs', () => {
      const result = parseCli('dbal rest pastebin pastebin Snippet')
      expect(result?.body).toBeUndefined()
    })

    it('parses rest with lowercase method override', () => {
      const result = parseCli('dbal rest pastebin pastebin Snippet post')
      expect(result?.method).toBe('POST')
    })
  })

  describe('parseKvPairs edge cases', () => {
    it('ignores parts without equals sign', () => {
      const result = parseCli('dbal create Snippet noequalssign')
      expect(result?.body).toEqual({})
    })

    it('handles value with equals signs', () => {
      const result = parseCli('dbal create Snippet url=a=b')
      expect(result?.body).toEqual({ url: 'a=b' })
    })

    it('strips surrounding double quotes from values', () => {
      // Note: shell word-splitting happens before parseCli sees the string,
      // so quoted strings with spaces arrive as separate tokens. This tests
      // the quote-stripping on a single-word quoted value.
      const result = parseCli('dbal create Snippet title="hello"')
      expect(result?.body).toEqual({ title: 'hello' })
    })

    it('keeps NaN-string as string', () => {
      const result = parseCli('dbal create Snippet tag=hello')
      expect(result?.body).toEqual({ tag: 'hello' })
    })
  })
})
