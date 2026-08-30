'use client'

import { createElement, type ReactNode } from 'react'
import { evaluate } from './vault-evaluate'
import { isTruthy } from './vault-template'
import type { Context } from './vault-context'
import type { VaultTreeNode } from './vault-view'
import { NATIVE_ELEMENTS, PRIMITIVES } from './tree/primitives'
import { NAMED_COMPONENTS } from './tree/NamedComponents'
import { nodeProps, resolveClassName } from './tree/node-props'
import { repeatKey, repeatSource, scopedContext } from './tree/repeat-source'
import s from './page.module.scss'

function childrenOf(node: VaultTreeNode, context: Context): ReactNode {
  return node.children?.map((child, index) => (
    <VaultNode key={`${child.component}-${index}`} node={child} context={context} />
  ))
}

interface RepeatNodeProps {
  node: VaultTreeNode
  context: Context
}

function RepeatNode({ node, context }: RepeatNodeProps) {
  const source = repeatSource(node, context)
  if (source === null) return null
  return (
    <>
      {source.map((item, index) => {
        const scoped = scopedContext(node, context, item, index)
        return (
          <span key={repeatKey(node, scoped, index)} className={s.repeatItem}>
            {childrenOf(node, scoped)}
          </span>
        )
      })}
    </>
  )
}

export function VaultNode({
  node,
  context,
}: {
  node: VaultTreeNode
  context: Context
}) {
  if (node.when !== undefined && !isTruthy(evaluate(node.when, context))) {
    return null
  }
  if (node.component === 'Repeat') {
    return <RepeatNode node={node} context={context} />
  }

  const children = childrenOf(node, context)

  if (NATIVE_ELEMENTS.has(node.component)) {
    const text =
      node.text === undefined ? undefined : evaluate(node.text, context)
    const props = {
      ...nodeProps(node, context, s),
      className: resolveClassName(node, context, s),
    }
    return createElement(node.component, props, text as ReactNode, children)
  }

  const Primitive = PRIMITIVES[node.component]
  if (Primitive !== undefined) {
    const text =
      node.text === undefined
        ? undefined
        : (evaluate(node.text, context) as ReactNode)
    return createElement(Primitive, nodeProps(node, context, s), text, children)
  }

  return NAMED_COMPONENTS[node.component]?.(children, context) ?? null
}
