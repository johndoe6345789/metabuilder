// Load single Lua script file (legacy support)
export async function loadLuaScript(packageId: string): Promise<string> {
  try {
    const response = await fetch(`/packages/${packageId}/seed/scripts.lua`)
    if (!response.ok) return ''
    return await response.text()
  } catch (error) {
    console.warn(`Could not load Lua scripts for package ${packageId}:`, error)
    return ''
  }
}
