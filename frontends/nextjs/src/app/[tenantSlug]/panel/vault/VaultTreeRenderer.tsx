import { createElement, type ComponentType, type ReactNode } from 'react'
import { Alert, Button, Chip, Paper, TextField, Typography } from '@/m3'
import { useVaultController } from './useVaultController'
import { vaultView, type VaultTreeNode } from './vault-view'
import { evaluate } from './vault-evaluate'
import type { Context, Controller } from './vault-context'
import {
  isTruthy,
  templateValue,
} from './vault-template'
import s from './page.module.scss'

const primitives: Record<string, ComponentType<Record<string, unknown>>> = {
  Alert: Alert as ComponentType<Record<string, unknown>>,
  Chip: Chip as ComponentType<Record<string, unknown>>,
  Button: Button as ComponentType<Record<string, unknown>>,
  Paper: Paper as ComponentType<Record<string, unknown>>,
  TextField: TextField as ComponentType<Record<string, unknown>>,
  Typography: Typography as ComponentType<Record<string, unknown>>,
}


function nodeProps(
  node: VaultTreeNode,
  context: Context
): Record<string, unknown> {
  const props = Object.fromEntries(
    Object.entries(node.props ?? {}).map(([key, value]) => [
      key,
      evaluate(value, context),
    ])
  )
  if (node.className !== undefined) {
    props.className =
      typeof node.className === 'string'
        ? s[node.className]
        : evaluate(node.className, context)
  }
  return props
}

function useDeclaredHooks(): { vault: Controller } {
  const vault = useVaultController()
  const declaration = vaultView.hooks.find(hook => hook.id === 'vault')
  if (declaration?.hook !== 'useVaultController') {
    throw new Error('Vault view must declare the useVaultController hook')
  }
  return { vault }
}

function childrenOf(node: VaultTreeNode, context: Context): ReactNode {
  return node.children?.map((child, index) => (
    <VaultNode
      key={`${child.component}-${index}`}
      node={child}
      context={context}
    />
  ))
}

function VaultNode({
  node,
  context,
}: {
  node: VaultTreeNode
  context: Context
}) {
  const { vault } = context
  if (node.when !== undefined && !isTruthy(evaluate(node.when, context)))
    return null
  if (node.component === 'Repeat') {
    const source =
      node.source === undefined ? [] : evaluate(node.source, context)
    if (!Array.isArray(source) || node.item === undefined) return null
    return source.map((item, index) => {
      const scoped = { ...context, [node.item!]: item, index }
      const key =
        node.key === undefined
          ? index
          : templateValue(evaluate(node.key, scoped))
      return (
        <span key={key} className={s.repeatItem}>
          {childrenOf(node, scoped)}
        </span>
      )
    })
  }
  const children = childrenOf(node, context)
  if (['div', 'header', 'button', 'strong', 'span'].includes(node.component)) {
    const className =
      node.className === undefined
        ? undefined
        : typeof node.className === 'string'
          ? s[node.className]
          : evaluate(node.className, context)
    const text =
      node.text === undefined ? undefined : evaluate(node.text, context)
    return createElement(
      node.component,
      { ...nodeProps(node, context), className },
      text as ReactNode,
      children
    )
  }
  const Primitive = primitives[node.component]
  if (Primitive !== undefined) {
    const text =
      node.text === undefined
        ? undefined
        : (evaluate(node.text, context) as ReactNode)
    return createElement(Primitive, nodeProps(node, context), text, children)
  }
  switch (node.component) {
    case 'Page':
      return <div className={s.page}>{children}</div>
    case 'Loading':
      return <Typography variant="body2">{vaultView.loadingLabel}</Typography>
    case 'Notice':
      return vault.notice === null ? null : (
        <Alert severity={vault.notice.kind} className={s.alert}>
          {vault.notice.message}
        </Alert>
      )
    case 'SplitLayout':
      return <div className={s.splitLayout}>{children}</div>
    case 'ListPanel':
      return <Paper className={s.listPanel}>{children}</Paper>
    case 'EditorPanel':
      return <Paper className={s.editorPanel}>{children}</Paper>
  }
  return null
}

export function VaultTreeRenderer() {
  const { vault } = useDeclaredHooks()
  const view = vault.authLoading
    ? 'loading'
    : vault.authenticated
      ? 'unlocked'
      : 'locked'
  return (
    <VaultNode
      node={vaultView.views[view]}
      context={{ vault, view: vaultView }}
    />
  )
}
