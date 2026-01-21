import { parseInputParameters } from './parse-parameters'
import { InputParameter } from '@/lib/types'

describe('parseInputParameters', () => {
  describe('empty/null inputs', () => {
    test('returns empty object when no parameters provided', () => {
      const result = parseInputParameters()
      expect(result).toEqual({})
    })

    test('returns empty object when empty array provided', () => {
      const result = parseInputParameters([])
      expect(result).toEqual({})
    })
  })

  describe('string type', () => {
    test('parses string value without quotes', () => {
      const params: InputParameter[] = [
        {
          name: 'title',
          type: 'string',
          defaultValue: '"Hello"',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.title).toBe('Hello')
    })

    test('parses string value with single quotes', () => {
      const params: InputParameter[] = [
        {
          name: 'text',
          type: 'string',
          defaultValue: "'World'",
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.text).toBe('World')
    })

    test('removes quotes from both ends of string', () => {
      const params: InputParameter[] = [
        {
          name: 'value',
          type: 'string',
          defaultValue: '"test string"',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.value).toBe('test string')
    })

    test('handles string with internal quotes', () => {
      const params: InputParameter[] = [
        {
          name: 'quote',
          type: 'string',
          defaultValue: '"He said \\"hello\\""',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.quote).toContain('He said')
    })
  })

  describe('number type', () => {
    test('parses integer string to number', () => {
      const params: InputParameter[] = [
        {
          name: 'count',
          type: 'number',
          defaultValue: '42',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.count).toBe(42)
      expect(typeof result.count).toBe('number')
    })

    test('parses float string to number', () => {
      const params: InputParameter[] = [
        {
          name: 'price',
          type: 'number',
          defaultValue: '19.99',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.price).toBe(19.99)
    })

    test('parses negative number', () => {
      const params: InputParameter[] = [
        {
          name: 'temperature',
          type: 'number',
          defaultValue: '-5',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.temperature).toBe(-5)
    })

    test('parses scientific notation', () => {
      const params: InputParameter[] = [
        {
          name: 'large',
          type: 'number',
          defaultValue: '1e5',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.large).toBe(100000)
    })
  })

  describe('boolean type', () => {
    test('parses "true" string to boolean true', () => {
      const params: InputParameter[] = [
        {
          name: 'isActive',
          type: 'boolean',
          defaultValue: 'true',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.isActive).toBe(true)
    })

    test('parses "false" string to boolean false', () => {
      const params: InputParameter[] = [
        {
          name: 'isDisabled',
          type: 'boolean',
          defaultValue: 'false',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.isDisabled).toBe(false)
    })

    test('parses non-"true" string to boolean false', () => {
      const params: InputParameter[] = [
        {
          name: 'value',
          type: 'boolean',
          defaultValue: 'anything',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.value).toBe(false)
    })
  })

  describe('array type', () => {
    test('parses JSON array string', () => {
      const params: InputParameter[] = [
        {
          name: 'items',
          type: 'array',
          defaultValue: '[1, 2, 3]',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.items).toEqual([1, 2, 3])
    })

    test('parses array of strings', () => {
      const params: InputParameter[] = [
        {
          name: 'names',
          type: 'array',
          defaultValue: '["alice", "bob", "charlie"]',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.names).toEqual(['alice', 'bob', 'charlie'])
    })

    test('parses empty array', () => {
      const params: InputParameter[] = [
        {
          name: 'empty',
          type: 'array',
          defaultValue: '[]',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.empty).toEqual([])
    })

    test('handles invalid JSON array gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const params: InputParameter[] = [
        {
          name: 'invalid',
          type: 'array',
          defaultValue: '[1, 2, ',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.invalid).toBe('[1, 2, ')
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('object type', () => {
    test('parses JSON object string', () => {
      const params: InputParameter[] = [
        {
          name: 'config',
          type: 'object',
          defaultValue: '{"key": "value"}',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.config).toEqual({ key: 'value' })
    })

    test('parses nested object', () => {
      const params: InputParameter[] = [
        {
          name: 'nested',
          type: 'object',
          defaultValue: '{"outer": {"inner": 42}}',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.nested).toEqual({ outer: { inner: 42 } })
    })

    test('parses empty object', () => {
      const params: InputParameter[] = [
        {
          name: 'empty',
          type: 'object',
          defaultValue: '{}',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.empty).toEqual({})
    })

    test('handles invalid JSON object gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const params: InputParameter[] = [
        {
          name: 'invalid',
          type: 'object',
          defaultValue: '{invalid json}',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.invalid).toBe('{invalid json}')
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  describe('multiple parameters', () => {
    test('parses multiple different types together', () => {
      const params: InputParameter[] = [
        { name: 'name', type: 'string', defaultValue: '"John"' } as InputParameter,
        { name: 'age', type: 'number', defaultValue: '30' } as InputParameter,
        { name: 'active', type: 'boolean', defaultValue: 'true' } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result).toEqual({
        name: 'John',
        age: 30,
        active: true,
      })
    })

    test('preserves parameter names correctly', () => {
      const params: InputParameter[] = [
        { name: 'firstName', type: 'string', defaultValue: '"Alice"' } as InputParameter,
        { name: 'lastName', type: 'string', defaultValue: '"Smith"' } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(Object.keys(result)).toContain('firstName')
      expect(Object.keys(result)).toContain('lastName')
    })
  })

  describe('error handling', () => {
    test('continues parsing other parameters if one fails', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const params: InputParameter[] = [
        { name: 'valid', type: 'number', defaultValue: '42' } as InputParameter,
        { name: 'invalid', type: 'number', defaultValue: 'not-a-number' } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.valid).toBe(42)
      expect(result.invalid).toBe(NaN)
      consoleSpy.mockRestore()
    })

    test('logs warning on parse error', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const params: InputParameter[] = [
        {
          name: 'broken',
          type: 'object',
          defaultValue: '{broken}',
        } as InputParameter,
      ]
      parseInputParameters(params)
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to parse parameter broken:'),
        expect.any(Error)
      )
      consoleSpy.mockRestore()
    })

    test('falls back to raw value on parse error', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      const params: InputParameter[] = [
        {
          name: 'fallback',
          type: 'object',
          defaultValue: 'original-value',
        } as InputParameter,
      ]
      const result = parseInputParameters(params)
      expect(result.fallback).toBe('original-value')
      consoleSpy.mockRestore()
    })
  })
})
