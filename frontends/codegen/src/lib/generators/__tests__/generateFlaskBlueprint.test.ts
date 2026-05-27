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

describe('generateFlaskBlueprint additional coverage', () => {
  it('generates correct imports', () => {
    const bp: FlaskBlueprint = {
      id: 'b1',
      name: 'Posts',
      urlPrefix: '/posts',
      description: 'Post management',
      endpoints: [],
    }
    const code = generateFlaskBlueprint(bp)
    expect(code).toContain('from flask import Blueprint, request, jsonify')
    expect(code).toContain('from typing import Dict, Any')
  })

  it('includes authentication comment for endpoints with authentication', () => {
    const bp: FlaskBlueprint = {
      id: 'b1',
      name: 'Secure',
      urlPrefix: '/secure',
      description: 'Secured',
      endpoints: [
        {
          id: 'e1',
          name: 'protected',
          description: 'Protected endpoint',
          method: 'GET',
          path: '/data',
          authentication: true,
        },
      ],
    }
    const code = generateFlaskBlueprint(bp)
    expect(code).toContain('# TODO: Add authentication check')
  })

  it('generates request.get_json() for POST endpoints', () => {
    const bp: FlaskBlueprint = {
      id: 'b1',
      name: 'Create',
      urlPrefix: '/items',
      description: 'Create items',
      endpoints: [
        {
          id: 'e1',
          name: 'create item',
          description: 'Create an item',
          method: 'POST',
          path: '/create',
        },
      ],
    }
    const code = generateFlaskBlueprint(bp)
    expect(code).toContain('data = request.get_json()')
    expect(code).toContain("return jsonify({'error': 'No data provided'}), 400")
  })

  it('generates request.get_json() for PUT and PATCH endpoints', () => {
    const bp: FlaskBlueprint = {
      id: 'b1',
      name: 'Update',
      urlPrefix: '/items',
      description: 'Update items',
      endpoints: [
        { id: 'e1', name: 'update', description: '', method: 'PUT', path: '/update' },
        { id: 'e2', name: 'patch', description: '', method: 'PATCH', path: '/patch' },
      ],
    }
    const code = generateFlaskBlueprint(bp)
    expect(code).toContain('data = request.get_json()')
  })

  it('handles required query params', () => {
    const bp: FlaskBlueprint = {
      id: 'b1',
      name: 'Search',
      urlPrefix: '/search',
      description: 'Search',
      endpoints: [
        {
          id: 'e1',
          name: 'search items',
          description: 'Search items by query',
          method: 'GET',
          path: '/items',
          queryParams: [
            { id: 'p1', name: 'query', type: 'string', required: true },
          ],
        },
      ],
    }
    const code = generateFlaskBlueprint(bp)
    expect(code).toContain("query = request.args.get('query')")
    expect(code).toContain("if query is None:")
    expect(code).toContain("return jsonify({'error': 'query is required'}), 400")
  })

  it('handles optional query params with defaults', () => {
    const bp: FlaskBlueprint = {
      id: 'b1',
      name: 'List',
      urlPrefix: '/list',
      description: 'List',
      endpoints: [
        {
          id: 'e1',
          name: 'list items',
          description: 'List items',
          method: 'GET',
          path: '/items',
          queryParams: [
            { id: 'p1', name: 'page', type: 'number', required: false, defaultValue: '1' },
          ],
        },
      ],
    }
    const code = generateFlaskBlueprint(bp)
    expect(code).toContain("page = request.args.get('page', 1)")
  })

  it('returns 200 JSON response for each endpoint', () => {
    const bp: FlaskBlueprint = {
      id: 'b1',
      name: 'Health',
      urlPrefix: '/health',
      description: 'Health check',
      endpoints: [
        { id: 'e1', name: 'healthcheck', description: 'Check health', method: 'GET', path: '/check' },
      ],
    }
    const code = generateFlaskBlueprint(bp)
    expect(code).toContain('return jsonify(result), 200')
  })
})
