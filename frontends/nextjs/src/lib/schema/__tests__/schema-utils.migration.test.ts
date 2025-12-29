import { describe, expect,it } from 'vitest'

import type { SchemaConfig } from '@/lib/schema-types'
import { findModel, getModelKey, getRecordsKey } from '@/lib/schema-utils'

import { createMockSchema } from './schema-utils.fixtures'

describe('schema-utils migration', () => {
  describe('getModelKey', () => {
    it.each([
      { appName: 'MyApp', modelName: 'User', expected: 'MyApp_User' },
      { appName: 'app-v2', modelName: 'User_Profile', expected: 'app-v2_User_Profile' },
      { appName: '', modelName: 'Model', expected: '_Model' },
    ])(
      'should generate key "$expected" for app=$appName, model=$modelName',
      ({ appName, modelName, expected }) => {
        const result = getModelKey(appName, modelName)
        expect(result).toBe(expected)
      }
    )
  })

  describe('getRecordsKey', () => {
    it('should generate a records key with prefix', () => {
      const result = getRecordsKey('MyApp', 'User')
      expect(result).toBe('records_MyApp_User')
    })

    it('should include records prefix', () => {
      const result = getRecordsKey('app', 'data')
      expect(result).toMatch(/^records_/)
    })
  })

  describe('findModel', () => {
    it('should find a model by app and model name', () => {
      const result = findModel(createMockSchema(), 'TestApp', 'User')
      expect(result).toBeDefined()
      expect(result?.name).toBe('User')
    })

    it('should return undefined if app not found', () => {
      const result = findModel(createMockSchema(), 'NonExistentApp', 'User')
      expect(result).toBeUndefined()
    })

    it('should return undefined if model not found in app', () => {
      const result = findModel(createMockSchema(), 'TestApp', 'NonExistentModel')
      expect(result).toBeUndefined()
    })

    it('should handle multiple apps correctly', () => {
      const multiAppSchema: SchemaConfig = {
        apps: [
          { name: 'App1', models: [{ name: 'Model1', fields: [] }] },
          { name: 'App2', models: [{ name: 'Model2', fields: [] }] },
        ],
      }
      const result = findModel(multiAppSchema, 'App2', 'Model2')
      expect(result?.name).toBe('Model2')
    })
  })
})
