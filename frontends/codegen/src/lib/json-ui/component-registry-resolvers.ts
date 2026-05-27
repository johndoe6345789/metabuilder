/**
 * component-registry-resolvers.ts
 *
 * Dynamic component resolvers for JSON components and icons.
 */
import { ComponentType } from 'react'
import dynamic from 'next/dynamic'

const jsonComponentDynamicCache = new Map<
  string,
  ComponentType<any>
>()

export const jsonComponentAliases: Record<string, string> = {
  SchemaEditorCanvas: 'MetabuilderWidgetSchemaEditorCanvas',
  SchemaEditorPropertiesPanel:
    'MetabuilderWidgetSchemaEditorPropertiesPanel',
  SchemaEditorSidebar: 'MetabuilderWidgetSchemaEditorSidebar',
  SchemaEditorToolbar: 'MetabuilderWidgetSchemaEditorToolbar',
  CanvasRenderer: 'MetabuilderWidgetCanvasRenderer',
  ComponentPalette: 'MetabuilderWidgetComponentPalette',
}

export function resolveJsonComponent(
  type: string,
  registry: Record<string, any>
): ComponentType<any> | null {
  const resolvedType = jsonComponentAliases[type] ?? type
  if (jsonComponentDynamicCache.has(resolvedType)) {
    return jsonComponentDynamicCache.get(resolvedType)!
  }
  const LazyJson = dynamic(
    () =>
      import('@/lib/json-ui/json-components').then((mod) => {
        const component = (mod as Record<string, any>)[
          resolvedType
        ]
        if (!component) {
          return {
            default: (() => null) as unknown as ComponentType,
          }
        }
        return { default: component }
      }),
    { ssr: false },
  )
  jsonComponentDynamicCache.set(resolvedType, LazyJson)
  registry[resolvedType] = LazyJson
  return LazyJson
}

const iconDynamicCache = new Map<string, ComponentType<any>>()

export function resolveIconComponent(
  type: string,
  registry: Record<string, any>
): ComponentType<any> | null {
  if (iconDynamicCache.has(type)) {
    return iconDynamicCache.get(type)!
  }
  const LazyIcon = dynamic(
    () =>
      import('@metabuilder/fakemui/icons').then((mod) => {
        const Icon = (mod as Record<string, any>)[type]
        if (!Icon) {
          return {
            default: (() => null) as unknown as ComponentType,
          }
        }
        return { default: Icon }
      }),
    { ssr: false },
  )
  iconDynamicCache.set(type, LazyIcon)
  registry[type] = LazyIcon
  return LazyIcon
}
