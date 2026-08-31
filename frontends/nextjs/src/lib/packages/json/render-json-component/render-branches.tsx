import React from 'react'
import type { JsonValue } from '@/types/utility-types'
import type { JSONComponent } from '../types'
import type { RenderContext } from '../render-json-component'
import { evaluateExpression } from './evaluate-expression'
import { isTruthy } from './truthiness'
import { getElementType } from './get-element-type'
import { buildComponentProps } from './component-props'
import { buildElementProps } from './element-props'
import { renderChildren } from './render-children'
import { Placeholder } from './error-placeholder'

export type RenderFn = (
  n: JsonValue,
  ctx: RenderContext
) => React.ReactElement

export function renderRef(
  ref: string,
  context: RenderContext,
  componentRegistry: Map<string, JSONComponent>,
  render: RenderFn
): React.ReactElement {
  const template = componentRegistry.get(ref)?.render?.template
  if (template !== undefined) return render(template, context)
  return (
    <Placeholder tone="ref-warning">
      <strong>Warning:</strong> Component reference "{ref}" not found
    </Placeholder>
  )
}

export function renderConditional(
  nodeObj: Record<string, JsonValue>,
  context: RenderContext,
  render: RenderFn
): React.ReactElement {
  const conditionValue = nodeObj.condition
  if (conditionValue === null || conditionValue === undefined) return <></>

  const conditionIsTrue = isTruthy(evaluateExpression(conditionValue, context))
  const branch = conditionIsTrue ? nodeObj.then : nodeObj.else
  if (branch === null || branch === undefined) return <></>
  return render(branch, context)
}

export function renderRegistryComponent(
  Component: React.ComponentType<Record<string, unknown>>,
  nodeObj: Record<string, JsonValue>,
  context: RenderContext,
  render: RenderFn
): React.ReactElement {
  const componentProps = buildComponentProps(nodeObj, context)
  const children = renderChildren(nodeObj.children, context, render)
  return <Component {...componentProps}>{children}</Component>
}

export function renderElement(
  nodeObj: Record<string, JsonValue>,
  nodeType: JsonValue | undefined,
  context: RenderContext,
  render: RenderFn
): React.ReactElement {
  const ElementType = getElementType(
    typeof nodeType === 'string' ? nodeType : 'div'
  )
  const elementProps = buildElementProps(nodeObj, context)
  const children = renderChildren(nodeObj.children, context, render)
  return React.createElement(ElementType, elementProps, children)
}
