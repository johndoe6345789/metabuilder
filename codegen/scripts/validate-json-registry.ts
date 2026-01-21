import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import * as PhosphorIcons from '@phosphor-icons/react'
import { JSONUIShowcase } from '../src/components/JSONUIShowcase'

type ComponentType = unknown

interface JsonRegistryEntry {
  name?: string
  type?: string
  export?: string
  source?: string
  status?: string
  wrapperRequired?: boolean
  wrapperComponent?: string
  wrapperFor?: string
  load?: {
    export?: string
  }
  deprecated?: unknown
}

interface JsonComponentRegistry {
  components?: JsonRegistryEntry[]
}

const sourceAliases: Record<string, Record<string, string>> = {
  atoms: {
    PageHeader: 'BasicPageHeader',
    SearchInput: 'BasicSearchInput',
  },
  molecules: {},
  organisms: {},
  ui: {
    Chart: 'ChartContainer',
    Resizable: 'ResizablePanelGroup',
  },
  wrappers: {},
}

const explicitComponentAllowlist: Record<string, ComponentType> = {
  JSONUIShowcase,
}

const getRegistryEntryKey = (entry: JsonRegistryEntry): string | undefined =>
  entry.name ?? entry.type

const getRegistryEntryExportName = (entry: JsonRegistryEntry): string | undefined =>
  entry.load?.export ?? entry.export ?? getRegistryEntryKey(entry)

const buildComponentMapFromExports = (
  exports: Record<string, unknown>
): Record<string, ComponentType> => {
  return Object.entries(exports).reduce<Record<string, ComponentType>>((acc, [key, value]) => {
    if (value && (typeof value === 'function' || typeof value === 'object')) {
      acc[key] = value as ComponentType
    }
    return acc
  }, {})
}

const buildComponentMapFromModules = (
  modules: Record<string, unknown>
): Record<string, ComponentType> => {
  return Object.values(modules).reduce<Record<string, ComponentType>>((acc, moduleExports) => {
    if (!moduleExports || typeof moduleExports !== 'object') {
      return acc
    }
    Object.entries(buildComponentMapFromExports(moduleExports as Record<string, unknown>)).forEach(
      ([key, component]) => {
        acc[key] = component
      }
    )
    return acc
  }, {})
}

const listFiles = async (options: {
  directory: string
  extensions: string[]
  recursive: boolean
}): Promise<string[]> => {
  const { directory, extensions, recursive } = options
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files: string[] = []

  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        if (recursive) {
          const nested = await listFiles({ directory: fullPath, extensions, recursive })
          files.push(...nested)
        }
        return
      }
      if (extensions.includes(path.extname(entry.name))) {
        files.push(fullPath)
      }
    })
  )

  return files
}

const importModules = async (files: string[]): Promise<Record<string, unknown>> => {
  const modules: Record<string, unknown> = {}
  await Promise.all(
    files.map(async (file) => {
      const moduleExports = await import(pathToFileURL(file).href)
      modules[file] = moduleExports
    })
  )
  return modules
}

const validateRegistry = async () => {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url))
  const rootDir = path.resolve(scriptDir, '..')
  const registryPath = path.join(rootDir, 'json-components-registry.json')

  const registryRaw = await fs.readFile(registryPath, 'utf8')
  const registry = JSON.parse(registryRaw) as JsonComponentRegistry
  const registryEntries = registry.components ?? []
  const registryEntryByType = new Map(
    registryEntries
      .map((entry) => {
        const entryKey = getRegistryEntryKey(entry)
        return entryKey ? [entryKey, entry] : null
      })
      .filter((entry): entry is [string, JsonRegistryEntry] => Boolean(entry))
  )

  const sourceConfigs = [
    {
      source: 'atoms',
      directory: path.join(rootDir, 'src/components/atoms'),
      extensions: ['.tsx'],
      recursive: false,
    },
    {
      source: 'molecules',
      directory: path.join(rootDir, 'src/components/molecules'),
      extensions: ['.tsx'],
      recursive: false,
    },
    {
      source: 'organisms',
      directory: path.join(rootDir, 'src/components/organisms'),
      extensions: ['.tsx'],
      recursive: false,
    },
    {
      source: 'ui',
      directory: path.join(rootDir, 'src/components/ui'),
      extensions: ['.ts', '.tsx'],
      recursive: true,
    },
    {
      source: 'wrappers',
      directory: path.join(rootDir, 'src/lib/json-ui/wrappers'),
      extensions: ['.tsx'],
      recursive: false,
    },
  ]

  const componentMaps: Record<string, Record<string, ComponentType>> = {}
  await Promise.all(
    sourceConfigs.map(async (config) => {
      const files = await listFiles({
        directory: config.directory,
        extensions: config.extensions,
        recursive: config.recursive,
      })
      const modules = await importModules(files)
      componentMaps[config.source] = buildComponentMapFromModules(modules)
    })
  )

  componentMaps.icons = buildComponentMapFromExports(PhosphorIcons)

  const errors: string[] = []

  registryEntries.forEach((entry) => {
    const entryKey = getRegistryEntryKey(entry)
    const entryExportName = getRegistryEntryExportName(entry)

    if (!entryKey || !entryExportName) {
      errors.push(`Entry missing name/type/export: ${JSON.stringify(entry)}`)
      return
    }

    const source = entry.source
    if (!source || !componentMaps[source]) {
      errors.push(`${entryKey}: unknown source "${source ?? 'missing'}"`)
      return
    }

    const aliasName = sourceAliases[source]?.[entryKey]
    const component =
      componentMaps[source][entryExportName] ??
      (aliasName ? componentMaps[source][aliasName] : undefined) ??
      explicitComponentAllowlist[entryKey]

    if (!component) {
      const aliasNote = aliasName ? ` (alias: ${aliasName})` : ''
      errors.push(
        `${entryKey} (${source}) did not resolve export "${entryExportName}"${aliasNote}`
      )
    }

    if (entry.wrapperRequired) {
      if (!entry.wrapperComponent) {
        errors.push(`${entryKey} (${source}) requires a wrapperComponent but none is defined`)
        return
      }
      if (!registryEntryByType.has(entry.wrapperComponent)) {
        errors.push(
          `${entryKey} (${source}) references missing wrapperComponent ${entry.wrapperComponent}`
        )
      }
    }
  })

  if (errors.length > 0) {
    console.error('❌ JSON component registry export validation failed:')
    errors.forEach((error) => console.error(`- ${error}`))
    process.exit(1)
  }

  console.log('✅ JSON component registry exports are valid.')
}

await validateRegistry()
