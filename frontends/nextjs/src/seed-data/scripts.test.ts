import { describe, it, expect, beforeEach, vi } from 'vitest'

const { getLuaScripts, addLuaScript } = vi.hoisted(() => ({
  getLuaScripts: vi.fn(),
  addLuaScript: vi.fn(),
}))

vi.mock('@/lib/database', () => ({
  Database: {
    getLuaScripts,
    addLuaScript,
  },
}))

import { initializeScripts } from '@/seed-data/scripts'

const expectedScriptIds = [
  'script_welcome_message',
  'script_format_date',
  'script_validate_email',
  'script_permission_check',
  'script_page_load_analytics',
]

describe('initializeScripts', () => {
  beforeEach(() => {
    getLuaScripts.mockReset()
    addLuaScript.mockReset()
  })

  it.each([
    {
      name: 'skip seeding when scripts exist',
      existingScripts: [{ id: 'existing' }],
      expectedAdds: 0,
    },
    {
      name: 'seed default scripts when none exist',
      existingScripts: [],
      expectedAdds: expectedScriptIds.length,
    },
  ])('should $name', async ({ existingScripts, expectedAdds }) => {
    getLuaScripts.mockResolvedValue(existingScripts)

    await initializeScripts()

    expect(getLuaScripts).toHaveBeenCalledTimes(1)
    expect(addLuaScript).toHaveBeenCalledTimes(expectedAdds)

    if (expectedAdds > 0) {
      expectedScriptIds.forEach(id => {
        expect(addLuaScript).toHaveBeenCalledWith(expect.objectContaining({ id }))
      })
    }
  })
})
