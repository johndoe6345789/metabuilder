import { beforeEach, describe, expect, it } from 'vitest'

import { DeclarativeComponentRenderer } from '@/lib/rendering/declarative-component-renderer'

describe('declarative-component-renderer evaluation', () => {
  let renderer: DeclarativeComponentRenderer

  beforeEach(() => {
    renderer = new DeclarativeComponentRenderer()
  })

  describe('interpolateValue', () => {
    it.each([
      {
        name: 'simple interpolation',
        template: 'Hello {name}!',
        context: { name: 'World' },
        expected: 'Hello World!',
      },
      {
        name: 'multiple placeholders',
        template: '{greeting} {name}, welcome to {place}',
        context: { greeting: 'Hi', name: 'Alice', place: 'Wonderland' },
        expected: 'Hi Alice, welcome to Wonderland',
      },
      {
        name: 'missing placeholder',
        template: 'Hello {name}, age: {age}',
        context: { name: 'Bob' },
        expected: 'Hello Bob, age: {age}',
      },
      {
        name: 'numeric value',
        template: 'Count: {count}',
        context: { count: 42 },
        expected: 'Count: 42',
      },
      {
        name: 'boolean value',
        template: 'Active: {active}',
        context: { active: true },
        expected: 'Active: true',
      },
      {
        name: 'empty template',
        template: '',
        context: { name: 'test' },
        expected: '',
      },
      {
        name: 'no placeholders',
        template: 'Plain text',
        context: { name: 'ignored' },
        expected: 'Plain text',
      },
      {
        name: 'null template',
        template: null as string,
        context: { name: 'test' },
        expected: null,
      },
      {
        name: 'undefined value in context',
        template: 'Value: {val}',
        context: { val: undefined },
        expected: 'Value: {val}',
      },
    ])('should handle $name', ({ template, context, expected }) => {
      expect(renderer.interpolateValue(template, context)).toBe(expected)
    })
  })

  describe('evaluateConditional', () => {
    it.each([
      { name: 'boolean true', condition: true, context: {}, expected: true },
      { name: 'boolean false', condition: false, context: {}, expected: false },
      { name: 'empty string condition', condition: '', context: {}, expected: true },
      { name: 'null condition', condition: null as string, context: {}, expected: true },
      { name: 'undefined condition', condition: undefined as string, context: {}, expected: true },
      {
        name: 'truthy context value',
        condition: 'isActive',
        context: { isActive: true },
        expected: true,
      },
      {
        name: 'falsy context value',
        condition: 'isActive',
        context: { isActive: false },
        expected: false,
      },
      { name: 'missing context key', condition: 'missing', context: {}, expected: false },
      { name: 'truthy string value', condition: 'name', context: { name: 'test' }, expected: true },
      { name: 'empty string value', condition: 'name', context: { name: '' }, expected: false },
      { name: 'zero value', condition: 'count', context: { count: 0 }, expected: false },
      { name: 'positive number', condition: 'count', context: { count: 5 }, expected: true },
    ])('should return $expected for $name', ({ condition, context, expected }) => {
      expect(renderer.evaluateConditional(condition, context)).toBe(expected)
    })
  })

  describe('resolveDataSource', () => {
    it.each([
      {
        name: 'existing array data source',
        dataSource: 'items',
        context: { items: [1, 2, 3] },
        expected: [1, 2, 3],
      },
      {
        name: 'empty array data source',
        dataSource: 'items',
        context: { items: [] },
        expected: [],
      },
      {
        name: 'missing data source',
        dataSource: 'missing',
        context: {},
        expected: [],
      },
      {
        name: 'null data source key',
        dataSource: '',
        context: { items: [1] },
        expected: [],
      },
      {
        name: 'object array data source',
        dataSource: 'users',
        context: {
          users: [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
          ],
        },
        expected: [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ],
      },
    ])('should resolve $name', ({ dataSource, context, expected }) => {
      expect(renderer.resolveDataSource(dataSource, context)).toEqual(expected)
    })
  })
})
