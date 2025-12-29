import type { LuaScriptFile } from './types'

// Load all Lua scripts from scripts folder
export async function loadLuaScriptsFolder(packageId: string): Promise<LuaScriptFile[]> {
  const scriptFiles: LuaScriptFile[] = []

  try {
    // Try to load scripts manifest (lists all script files in the folder)
    const manifestResponse = await fetch(`/packages/${packageId}/seed/scripts/manifest.json`)

    if (manifestResponse.ok) {
      const manifest = await manifestResponse.json()

      // Load each script file listed in the manifest
      for (const scriptInfo of manifest.scripts || []) {
        try {
          const scriptResponse = await fetch(
            `/packages/${packageId}/seed/scripts/${scriptInfo.file}`
          )
          if (scriptResponse.ok) {
            const code = await scriptResponse.text()
            scriptFiles.push({
              name: scriptInfo.name || scriptInfo.file,
              path: `scripts/${scriptInfo.file}`,
              code,
              category: scriptInfo.category,
              description: scriptInfo.description,
            })
          }
        } catch (error) {
          console.warn(`Could not load script ${scriptInfo.file} for package ${packageId}:`, error)
        }
      }
    } else {
      // Fallback: try to load common script names
      const commonScriptNames = [
        'init.lua',
        'handlers.lua',
        'validators.lua',
        'utils.lua',
        'state.lua',
        'actions.lua',
      ]

      for (const filename of commonScriptNames) {
        try {
          const scriptResponse = await fetch(`/packages/${packageId}/seed/scripts/${filename}`)
          if (scriptResponse.ok) {
            const code = await scriptResponse.text()
            scriptFiles.push({
              name: filename.replace('.lua', ''),
              path: `scripts/${filename}`,
              code,
              category: 'auto-discovered',
            })
          }
        } catch (error) {
          // Silently skip missing files in fallback mode
        }
      }
    }
  } catch (error) {
    console.warn(`Could not load scripts folder for package ${packageId}:`, error)
  }

  return scriptFiles
}
