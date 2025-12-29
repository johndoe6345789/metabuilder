import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockCreate = vi.fn()
const mockAdapter = { create: mockCreate }

vi.mock('../../core/dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { addSchema } from './add-schema'

describe('addSchema', () => {
  beforeEach(() => {
    mockCreate.mockReset()
  })

  it.each([
    {
      name: 'basic schema',
      schema: { name: 'User', fields: [{ name: 'id', type: 'string' }] },
    },
    {
      name: 'full schema',
      schema: {
        name: 'Post',
        label: 'Blog Post',
        labelPlural: 'Posts',
        fields: [],
        listDisplay: ['title'],
      },
    },
  ])('should add $name', async ({ schema }) => {
    mockCreate.mockResolvedValue(undefined)

    await addSchema(schema as any)

    expect(mockCreate).toHaveBeenCalledWith(
      'ModelSchema',
      expect.objectContaining({
        name: schema.name,
      })
    )
  })
})
