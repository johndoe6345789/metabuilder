/** renderer-utils.tsx — shared render helpers for JSONUIRenderer. */
import React from 'react'
import type { UIComponent } from './types'
import { sanitizeDomProps } from './renderer-helpers'
import type {
  DepthProviderComponent,
  RenderNodeFn,
} from './renderer-types'

export type RendererFn = React.ComponentType<{
  component: UIComponent
  dataMap: Record<string, unknown>
  onAction?: (actions: any[], event?: any) => void
  context: Record<string, unknown>
}>

export function makeRenderNode(
  JSONUIRenderer: RendererFn,
  DepthProvider: DepthProviderComponent,
  dataMap: Record<string, unknown>,
  onAction?: (actions: any[], event?: any) => void
): RenderNodeFn {
  return (node, ctx) => {
    if (typeof node === 'string') return node
    return (
      <DepthProvider>
        <JSONUIRenderer
          component={node}
          dataMap={dataMap}
          onAction={onAction}
          context={ctx}
        />
      </DepthProvider>
    )
  }
}

export function makeRenderChildren(renderNode: RenderNodeFn) {
  return (
    children: UIComponent[] | string | undefined,
    ctx: Record<string, unknown>
  ): React.ReactNode => {
    if (!children) return null
    if (typeof children === 'string') return children
    return children.map((child, i) => (
      <React.Fragment key={child.id || `child-${i}`}>
        {renderNode(child, ctx)}
      </React.Fragment>
    ))
  }
}

type Branch =
  | UIComponent | (UIComponent | string)[] | string | undefined

export function makeRenderBranch(renderNode: RenderNodeFn) {
  return (branch: Branch, ctx: Record<string, unknown>) => {
    if (branch === undefined) return null
    if (Array.isArray(branch)) {
      return branch.map((item, i) => (
        <React.Fragment
          key={typeof item === 'string' ? `text-${i}` :
            (item as UIComponent).id || `branch-${i}`}
        >
          {renderNode(item, ctx)}
        </React.Fragment>
      ))
    }
    return renderNode(branch, ctx)
  }
}

export function renderElement(
  Component: any,
  props: Record<string, any>,
  children: React.ReactNode
): React.ReactNode {
  if (typeof Component === 'string') {
    const domProps = { ...props }
    sanitizeDomProps(domProps)
    if (
      'value' in domProps &&
      typeof domProps.onChange !== 'function'
    ) {
      domProps.defaultValue = domProps.value
      delete domProps.value
    }
    return children !== null
      ? React.createElement(Component, domProps, children)
      : React.createElement(Component, domProps)
  }
  return children !== null
    ? <Component {...props}>{children}</Component>
    : <Component {...props} />
}

export { missingComponent } from './renderer-missing'
