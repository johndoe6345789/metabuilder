import { createElement, type ComponentType, type ReactNode } from 'react'
import { Alert, Button, Chip, Paper, TextField, Typography } from '@/m3'
import { useVaultController } from './useVaultController'
import { vaultView, type VaultBinding, type VaultTreeNode } from './vault-view'
import { resolveEvent } from './vault-events'
import s from './page.module.scss'

type Controller = ReturnType<typeof useVaultController>
type Context = { vault: Controller; view: typeof vaultView } & Record<
  string,
  unknown
>

const primitives: Record<string, ComponentType<Record<string, unknown>>> = {
  Alert: Alert as ComponentType<Record<string, unknown>>,
  Chip: Chip as ComponentType<Record<string, unknown>>,
  Button: Button as ComponentType<Record<string, unknown>>,
  Paper: Paper as ComponentType<Record<string, unknown>>,
  TextField: TextField as ComponentType<Record<string, unknown>>,
  Typography: Typography as ComponentType<Record<string, unknown>>,
}

function readPath(context: Context, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (typeof value !== 'object' || value === null) return undefined
    return (value as Record<string, unknown>)[key]
  }, context)
}

function templateValue(value: unknown): string {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
    return String(value)
  return ''
}

function isTruthy(value: unknown): boolean {
  return (
    value !== undefined &&
    value !== null &&
    value !== false &&
    value !== 0 &&
    value !== ''
  )
}

function evaluate(
  binding: string | boolean | VaultBinding,
  context: Context
): unknown {
  if (typeof binding !== 'object') return binding
  if ('$path' in binding) return readPath(context, binding.$path)
  if ('$template' in binding) {
    return binding.$template.replace(/\{\{([^}]+)\}\}/g, (_, path: string) =>
      templateValue(readPath(context, path.trim()))
    )
  }
  if ('$eq' in binding) {
    return (
      evaluate(binding.$eq[0], context) === evaluate(binding.$eq[1], context)
    )
  }
  if ('$not' in binding) return !isTruthy(evaluate(binding.$not, context))
  if ('$or' in binding) {
    return binding.$or.some(value => isTruthy(evaluate(value, context)))
  }
  if ('$and' in binding) {
    return binding.$and.every(value => isTruthy(evaluate(value, context)))
  }
  if ('$if' in binding) {
    return isTruthy(evaluate(binding.$if.condition, context))
      ? evaluate(binding.$if.then, context)
      : evaluate(binding.$if.else, context)
  }
  if ('$classes' in binding) {
    return binding.$classes
      .flatMap(value => {
        if (typeof value === 'string') return s[value] ?? []
        return evaluate(value.when, context) === true
          ? (s[value.name] ?? [])
          : []
      })
      .join(' ')
  }
  const reference =
    typeof binding.$event === 'string'
      ? binding.$event
      : evaluate(binding.$event, context)
  if (typeof reference !== 'string')
    throw new Error('Event reference must resolve to a string')
  const handler = resolveEvent(context, reference)
  const args = binding.$args?.map(argument => evaluate(argument, context)) ?? []
  return binding.$value === 'target.value'
    ? (event: { target: { value: string } }) =>
        handler(...args, event.target.value)
    : () => handler(...args)
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
