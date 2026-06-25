/**
 * renderer-types.ts
 *
 * Shared types for renderer sub-modules.
 */
import React from 'react'
import type { UIComponent } from './types'

export type RenderNodeFn = (
  node: UIComponent | string,
  ctx: Record<string, unknown>
) => React.ReactNode

export type RenderBranchFn = (
  branch:
    | UIComponent
    | (UIComponent | string)[]
    | string
    | undefined,
  ctx: Record<string, unknown>
) => React.ReactNode

export type RenderChildrenFn = (
  children: UIComponent[] | string | undefined,
  ctx: Record<string, unknown>
) => React.ReactNode

export type RenderElementFn = (
  Component: any,
  props: Record<string, any>,
  children: React.ReactNode
) => React.ReactNode

export type DepthProviderComponent =
  React.ComponentType<{ children: React.ReactNode }>

export interface LoopRenderArgs {
  component: UIComponent
  dataMap: Record<string, unknown>
  context: Record<string, unknown>
  getComponent: (type: string) => any
  onAction?: (actions: any[], event?: any) => void
  renderChildren: RenderChildrenFn
  renderBranch: RenderBranchFn
  renderElement: RenderElementFn
  missingComponent: (type: string) => React.ReactNode
  DepthProvider: DepthProviderComponent
  JSONUIRenderer: React.ComponentType<any>
}
