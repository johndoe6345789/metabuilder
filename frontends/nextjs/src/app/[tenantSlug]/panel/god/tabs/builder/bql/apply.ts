'use client'

/**
 * Turns a whole BQL script into a tree, in one pass, with no partial
 * results: syntax is parsed by DBAL's shared BQL parser first, then every
 * block name and property is resolved against the real PALETTE and
 * PROP_SCHEMAS the visual builder itself uses -- that semantic layer is
 * this app's own vocabulary, so it stays here rather than in DBAL. If
 * anything fails to resolve, the original tree and classes come back
 * untouched and every error found is reported together -- a script never
 * applies "most of the way".
 */
import type { PropField } from '@/components/blocks/block-props'
import { propSchema } from '@/components/blocks/block-props'
import type { CssClass } from '../../styles/use-css-classes'
import type { TreeNode } from '../builder-registry'
import { paletteItem, paletteItemByName } from '../builder-registry'
import { insertChild, mapTree, nid } from '../component-tree-utils'
import { inferred } from '../auto-props-infer'
import { coerceValue, resolveField } from './fields'
import { parseBqlViaDbal } from './dbal-parse'
import type { BqlAttr } from './types'

export interface BqlError {
  line: number
  message: string
}

export interface ApplyBqlResult {
  tree: TreeNode
  classes: CssClass[]
  errors: BqlError[]
  warnings: string[]
}

function fieldsFor(type: string): PropField[] {
  return propSchema(type) ?? inferred(paletteItem(type)?.defaults ?? {})
}

function applyAttrs(
  fields: PropField[],
  attrs: BqlAttr[],
  props: Record<string, unknown>,
  line: number,
  errors: BqlError[]
): void {
  for (const attr of attrs) {
    const field = resolveField(fields, attr.key)
    if (field === undefined) {
      errors.push({ line, message: `No property called "${attr.key}" here` })
      continue
    }
    const coerced = coerceValue(field, attr.value)
    if ('error' in coerced) {
      errors.push({ line, message: coerced.error })
      continue
    }
    props[field.name] = coerced.value
  }
}

export async function applyBql(
  script: string,
  tenant: string,
  rootId: string,
  tree: TreeNode,
  classes: CssClass[]
): Promise<ApplyBqlResult> {
  const parsed = await parseBqlViaDbal(tenant, script)
  if (!parsed.ok) {
    return { tree, classes, errors: parsed.errors, warnings: [] }
  }
  let workingTree = tree
  let workingClasses = classes
  const errors: BqlError[] = []
  const aliasToId = new Map<string, string>()
  const aliasToType = new Map<string, string>()

  for (const sentence of parsed.sentences) {
    const line = sentence.line
    if (sentence.kind === 'add') {
      const item = paletteItemByName(sentence.blockName)
      if (item === undefined) {
        errors.push({ line, message: `No block called "${sentence.blockName}"` })
        continue
      }
      let parentId = rootId
      if (sentence.parentAlias !== undefined) {
        const resolved = aliasToId.get(sentence.parentAlias)
        if (resolved === undefined) {
          errors.push({
            line,
            message: `"${sentence.parentAlias}" hasn't been added yet`,
          })
          continue
        }
        parentId = resolved
      }
      const fields = fieldsFor(item.type)
      const props: Record<string, unknown> = { ...item.defaults }
      if (sentence.text !== undefined) {
        const primary = fields.find(f => f.type === 'text')
        if (primary === undefined) {
          errors.push({ line, message: `A ${item.name} has no text of its own` })
        } else {
          props[primary.name] = sentence.text
        }
      }
      applyAttrs(fields, sentence.attrs, props, line, errors)
      const node: TreeNode = { id: nid(), type: item.type, props, children: [] }
      workingTree = insertChild(workingTree, parentId, node)
      if (sentence.alias !== undefined) {
        aliasToId.set(sentence.alias, node.id)
        aliasToType.set(sentence.alias, item.type)
      }
    } else if (sentence.kind === 'give') {
      const id = aliasToId.get(sentence.alias)
      const type = aliasToType.get(sentence.alias)
      if (id === undefined || type === undefined) {
        errors.push({ line, message: `"${sentence.alias}" hasn't been added yet` })
        continue
      }
      const patch: Record<string, unknown> = {}
      applyAttrs(fieldsFor(type), sentence.attrs, patch, line, errors)
      workingTree = mapTree(workingTree, n =>
        n.id === id ? { ...n, props: { ...n.props, ...patch } } : n
      )
    } else if (sentence.kind === 'style') {
      const cssProps: Record<string, string> = {}
      for (const attr of sentence.attrs) cssProps[attr.key] = attr.value
      const existing = workingClasses.find(c => c.name === sentence.name)
      const newClass = { id: nid(), name: sentence.name, props: cssProps }
      workingClasses =
        existing === undefined
          ? [...workingClasses, newClass]
          : workingClasses.map(c =>
              c.id === existing.id
                ? { ...c, props: { ...c.props, ...cssProps } }
                : c
            )
    } else {
      const id = aliasToId.get(sentence.alias)
      if (id === undefined) {
        errors.push({ line, message: `"${sentence.alias}" hasn't been added yet` })
        continue
      }
      const unknown = sentence.names.filter(
        name => !workingClasses.some(c => c.name === name)
      )
      if (unknown.length > 0) {
        errors.push({ line, message: `No style called "${unknown[0]}"` })
        continue
      }
      workingTree = mapTree(workingTree, n => {
        if (n.id !== id) return n
        const current =
          typeof n.props.className === 'string'
            ? n.props.className.split(/\s+/).filter(Boolean)
            : []
        const names = [...new Set([...current, ...sentence.names])]
        return { ...n, props: { ...n.props, className: names.join(' ') } }
      })
    }
  }

  if (errors.length > 0) return { tree, classes, errors, warnings: [] }
  return {
    tree: workingTree,
    classes: workingClasses,
    errors: [],
    warnings: [],
  }
}
