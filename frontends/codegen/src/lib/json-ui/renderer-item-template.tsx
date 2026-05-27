/**
 * renderer-item-template.tsx
 *
 * Item-template rendering extracted from renderer.tsx.
 */
import React from 'react'
import type { UIComponent } from './types'
import { renderElement } from './renderer-utils'

interface ItemTemplateArgs {
  component: UIComponent
  ComponentClass: any
  props: Record<string, any>
  dataMap: Record<string, unknown>
  context: Record<string, unknown>
  onAction?: (actions: any[], event?: any) => void
  DepthProvider: React.ComponentType<{
    children: React.ReactNode
  }>
  JSONUIRenderer: React.ComponentType<any>
}

export function renderItemTemplate(
  args: ItemTemplateArgs
): React.ReactNode {
  const {
    component,
    ComponentClass,
    props,
    dataMap,
    context,
    onAction,
    DepthProvider,
    JSONUIRenderer,
  } = args

  const items = props.items
  const keyPath =
    typeof props.keyPath === 'string'
      ? props.keyPath
      : undefined
  delete props.items
  delete props.keyPath

  if (!Array.isArray(items)) {
    return renderElement(ComponentClass, props, null)
  }

  const itemChildren = items.map(
    (itemData: any, i: number) => {
      const itemCtx = {
        ...context,
        item: itemData,
        index: i,
      }
      const key =
        keyPath && itemData
          ? itemData[keyPath]
          : `${component.id}-item-${i}`
      return (
        <DepthProvider key={key}>
          <JSONUIRenderer
            component={component.itemTemplate!}
            dataMap={dataMap}
            onAction={onAction}
            context={itemCtx}
          />
        </DepthProvider>
      )
    }
  )

  return renderElement(ComponentClass, props, itemChildren)
}
