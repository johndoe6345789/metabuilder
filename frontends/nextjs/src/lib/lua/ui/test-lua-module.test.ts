import { describe, expect,it } from 'bun:test'

import { createLuaEngine } from '@/lib/lua/engine/core/create-lua-engine'
import { executeLuaCode } from '@/lib/lua/functions/execution/execute-lua-code'

describe('Lua module loading', () => {
  it('should load a simple Lua module with function', async () => {
    const luaCode = `
local M = {}

function M.render()
  return {
    type = "Box",
    props = { padding = 2 }
  }
end

return M
`

    const engine = createLuaEngine()
    const result = await executeLuaCode(engine.L, luaCode, {}, [])

    console.log('Execution result:', JSON.stringify(result, null, 2))
    console.log('Result type:', typeof result.result)
    console.log('Result keys:', result.result ? Object.keys(result.result) : 'no keys')

    engine.destroy()

    expect(result.success).toBe(true)
  })
})
