import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockList = vi.fn()
const mockAdapter = { list: mockList }

vi.mock('../dbal-client', () => ({
  getAdapter: () => mockAdapter,
}))

import { getComponentConfigs } from './get-component-configs'

describe('getComponentConfigs', () => {
  beforeEach(() => {
    mockList.mockReset()
  })

  it.each([
    { name: 'empty', dbData: [], expectedKeys: 0 },
    {
      name: 'parsed configs',
      dbData: [{ id: 'cfg1', componentId: 'c1', props: '{}', styles: '{}', events: '{}', conditionalRendering: null }],
      expectedKeys: 1,
    },
  ])('should return $name', async ({ dbData, expectedKeys }) => {
    mockList.mockResolvedValue({ data: dbData })

    const result = await getComponentConfigs()

    expect(Object.keys(result)).toHaveLength(expectedKeys)
  })
})
