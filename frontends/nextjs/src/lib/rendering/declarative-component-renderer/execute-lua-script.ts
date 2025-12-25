import type { DeclarativeRendererState } from './renderer-state'

export async function executeLuaScript(
  state: DeclarativeRendererState,
  scriptId: string,
  params: any[]
): Promise<any> {
  const script = state.luaScripts[scriptId]
  if (!script) {
    throw new Error(`Lua script not found: ${scriptId}`)
  }

  const paramContext: Record<string, any> = {}
  script.parameters.forEach((param, index) => {
    if (params[index] !== undefined) {
      paramContext[param.name] = params[index]
    }
  })

  const paramAssignments = script.parameters
    .map(p => `local ${p.name} = context.data.params["${p.name}"]`)
    .join('\n')

  const paramList = script.parameters.map(p => p.name).join(', ')

  const wrappedCode = `
${paramAssignments}

${script.code}

local result_fn = sendMessage or handleCommand or formatTime or userJoin or userLeave or countThreads
if result_fn and type(result_fn) == "function" then
  return result_fn(${paramList})
end
`

  const result = await state.luaEngine.execute(wrappedCode, {
    data: { params: paramContext },
  })

  if (!result.success) {
    console.error(`Lua script error (${scriptId}):`, result.error, result.logs)
    throw new Error(result.error || 'Lua script execution failed')
  }

  return result.result
}
