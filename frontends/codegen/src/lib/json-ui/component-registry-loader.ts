/**
 * Dynamic component loader — next/dynamic wrappers around webpack contexts.
 */
import { ComponentType } from 'react'
import dynamic from 'next/dynamic'
import type { UIComponentRegistry } from './component-registry-types'
import {
  jsonRegistryEntries,
  getRegistryEntryKey,
  getRegistryEntryExportName,
} from './component-registry-types'
import {
  explicitContext,
} from './component-registry-context'

export { atomContext, moleculeContext, organismContext }
  from './component-registry-context'

export const normalizeLoadPath = (
  loadPath: string,
): string => {
  let normalized = loadPath
  if (normalized.startsWith('@/components/')) {
    normalized = './' + normalized.slice('@/components/'.length)
  }
  if (
    !normalized.endsWith('.tsx') &&
    !normalized.endsWith('.ts')
  ) {
    normalized += '.tsx'
  }
  return normalized
}

export function createDynamicFromContext(
  ctx: __WebpackModuleApi.RequireContext,
  contextKey: string,
  exportName: string,
): ComponentType<any> {
  return dynamic(
    () =>
      ctx(contextKey).then((mod: any) => ({
        default:
          mod[exportName] ?? mod.default ?? (() => null),
      })),
    { ssr: false },
  )
}

export function findContextKey(
  ctx: __WebpackModuleApi.RequireContext,
  loadPath?: string,
  exportName?: string,
  entryKey?: string,
): string | undefined {
  if (loadPath) {
    const normalized = normalizeLoadPath(loadPath)
    const found = ctx
      .keys()
      .find((k) => k === loadPath || k === normalized)
    if (found) return found
  }
  if (exportName || entryKey) {
    return ctx.keys().find((k) => {
      const name = k
        .replace(/^\.\//, '')
        .replace(/\.(tsx?|jsx?)$/, '')
        .split('/')
        .pop()
      return name === exportName || name === entryKey
    })
  }
  return undefined
}

export const buildRegistryFromEntries = (
  source: string,
  lazyCtx: __WebpackModuleApi.RequireContext | null,
  syncMap?: Record<string, ComponentType<any>>,
): UIComponentRegistry => {
  return jsonRegistryEntries
    .filter((entry: any) => entry.source === source)
    .reduce<UIComponentRegistry>((registry, entry: any) => {
      const entryKey = getRegistryEntryKey(entry)
      const entryExportName = getRegistryEntryExportName(entry)
      if (!entryKey || !entryExportName) return registry
      if (syncMap?.[entryExportName]) {
        registry[entryKey] = syncMap[entryExportName]
        return registry
      }
      if (entry.load?.path) {
        const ck = findContextKey(
          explicitContext, entry.load.path,
        )
        if (ck) {
          registry[entryKey] = createDynamicFromContext(
            explicitContext, ck, entryExportName,
          )
          return registry
        }
      }
      if (lazyCtx) {
        const ck = findContextKey(
          lazyCtx, undefined, entryExportName, entryKey,
        )
        if (ck) {
          registry[entryKey] = createDynamicFromContext(
            lazyCtx, ck, entryExportName,
          )
          return registry
        }
      }
      const fk = findContextKey(
        explicitContext, undefined, entryExportName, entryKey,
      )
      if (fk) {
        registry[entryKey] = createDynamicFromContext(
          explicitContext, fk, entryExportName,
        )
      }
      return registry
    }, {})
}
