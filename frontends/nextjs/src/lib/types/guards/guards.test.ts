import { describe, expect, it } from 'vitest'

import { getErrorMessage } from './get-error-message'
import { hasProperty } from './has-property'
import { isError } from './is-error'
import { isErrorLike } from './is-error-like'
import { isJsonValue } from './is-json-value'

describe('Type Guards', () => {
  describe('isError', () => {
    it.each([
      { value: new Error('test'), expected: true, description: 'Error instance' },
      { value: new TypeError('test'), expected: true, description: 'TypeError instance' },
      { value: { message: 'test' }, expected: false, description: 'Error-like object' },
      { value: 'error', expected: false, description: 'string' },
      { value: null, expected: false, description: 'null' },
      { value: undefined, expected: false, description: 'undefined' },
    ])('should return $expected for $description', ({ value, expected }) => {
      expect(isError(value)).toBe(expected)
    })
  })

  describe('isErrorLike', () => {
    it.each([
      { value: { message: 'test' }, expected: true, description: 'object with message string' },
      { value: new Error('test'), expected: true, description: 'Error instance' },
      { value: { message: 123 }, expected: false, description: 'object with message number' },
      { value: {}, expected: false, description: 'empty object' },
      { value: 'test', expected: false, description: 'string' },
      { value: null, expected: false, description: 'null' },
    ])('should return $expected for $description', ({ value, expected }) => {
      expect(isErrorLike(value)).toBe(expected)
    })
  })

  describe('isJsonValue', () => {
    it.each([
      { value: 'string', expected: true, description: 'string' },
      { value: 123, expected: true, description: 'number' },
      { value: true, expected: true, description: 'boolean' },
      { value: null, expected: true, description: 'null' },
      { value: [], expected: true, description: 'empty array' },
      { value: [1, 2, 3], expected: true, description: 'number array' },
      { value: {}, expected: true, description: 'empty object' },
      { value: { a: 1, b: 'test' }, expected: true, description: 'simple object' },
      { value: { nested: { deep: true } }, expected: true, description: 'nested object' },
      { value: undefined, expected: false, description: 'undefined' },
      { value: () => {}, expected: false, description: 'function' },
      { value: Symbol('test'), expected: false, description: 'symbol' },
    ])('should return $expected for $description', ({ value, expected }) => {
      expect(isJsonValue(value)).toBe(expected)
    })
  })

  describe('getErrorMessage', () => {
    it.each([
      {
        value: new Error('error message'),
        expected: 'error message',
        description: 'Error instance',
      },
      {
        value: { message: 'custom error' },
        expected: 'custom error',
        description: 'error-like object',
      },
      { value: 'string error', expected: 'string error', description: 'string' },
      { value: null, expected: 'An unknown error occurred', description: 'null' },
      { value: undefined, expected: 'An unknown error occurred', description: 'undefined' },
      { value: 123, expected: 'An unknown error occurred', description: 'number' },
      { value: {}, expected: 'An unknown error occurred', description: 'empty object' },
    ])('should return "$expected" for $description', ({ value, expected }) => {
      expect(getErrorMessage(value)).toBe(expected)
    })
  })

  describe('hasProperty', () => {
    it.each([
      { obj: { name: 'test' }, key: 'name', expected: true, description: 'object with property' },
      {
        obj: { name: 'test' },
        key: 'age',
        expected: false,
        description: 'object without property',
      },
      { obj: {}, key: 'name', expected: false, description: 'empty object' },
      { obj: null, key: 'name', expected: false, description: 'null' },
      { obj: undefined, key: 'name', expected: false, description: 'undefined' },
      {
        obj: 'string',
        key: 'length',
        expected: false,
        description: 'string (primitive, not object)',
      },
    ])('should return $expected for $description', ({ obj, key, expected }) => {
      expect(hasProperty(obj, key)).toBe(expected)
    })
  })
})
