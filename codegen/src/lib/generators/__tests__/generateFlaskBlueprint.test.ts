import { describe, expect, it } from 'vitest'

import type { FlaskBlueprint } from '@/types/project'

import { generateFlaskBlueprint } from '../generateFlaskBlueprint'

const isValidIdentifier = (name: string): boolean => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name)

const extractBlueprintVariable = (code: string): { variable: string; name: string } => {
  const match = code.match(/^([A-Za-z_][A-Za-z0-9_]*)_bp = Blueprint\('([^']+)'/m)
  if (!match) {
    throw new Error('Blueprint definition not found.')
  }
  return { variable: `${match[1]}_bp`, name: match[2] }
}

const extractFunctionNames = (code: string): string[] => {
  return Array.from(code.matchAll(/^def ([A-Za-z_][A-Za-z0-9_]*)\(\):/gm)).map(match => match[1])
}

const extractDecoratorBlueprints = (code: string): string[] => {
  return Array.from(code.matchAll(/^@([A-Za-z_][A-Za-z0-9_]*)\.route/gm)).map(match => match[1])
}

describe('generateFlaskBlueprint identifier sanitization', () => {
  it('creates valid, consistent identifiers for tricky endpoint names', () => {
    const blueprint: FlaskBlueprint = {
      id: 'bp-1',
      name: 'User Auth',
      urlPrefix: '/auth',
      description: 'Auth endpoints',
      endpoints: [
        {
          id: 'ep-1',
          name: 'get-user',
          description: 'Fetch a user',
          method: 'GET',
          path: '/user'
        },
        {
          id: 'ep-2',
          name: '2fa',
          description: 'Two factor auth',
          method: 'POST',
          path: '/2fa'
        },
        {
          id: 'ep-3',
          name: 'user.v1',
          description: 'User v1 endpoint',
          method: 'GET',
          path: '/user/v1'
        }
      ]
    }

    const code = generateFlaskBlueprint(blueprint)
    const blueprintDefinition = extractBlueprintVariable(code)
    const functionNames = extractFunctionNames(code)
    const decoratorBlueprints = extractDecoratorBlueprints(code)

    expect(isValidIdentifier(blueprintDefinition.name)).toBe(true)
    expect(isValidIdentifier(blueprintDefinition.variable)).toBe(true)
    expect(blueprintDefinition.variable).toBe('user_auth_bp')
    expect(blueprintDefinition.name).toBe('user_auth')
    expect(new Set(decoratorBlueprints)).toEqual(new Set([blueprintDefinition.variable]))

    expect(functionNames).toEqual(['get_user', '_2fa', 'user_v1'])
    functionNames.forEach(name => {
      expect(isValidIdentifier(name)).toBe(true)
    })
  })
})
