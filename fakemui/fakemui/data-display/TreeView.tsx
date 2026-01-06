import React, { useState, useCallback, useMemo } from 'react'
import clsx from 'clsx'
import styles from '../../styles/TreeView.module.scss'

export interface TreeNode {
  id: string
  label: string
  icon?: React.ReactNode
  children?: TreeNode[]
  disabled?: boolean
}

export interface TreeViewProps {
  /** Tree data nodes */
  data: TreeNode[]
  /** Initially expanded node IDs */
  defaultExpanded?: string[]
  /** Controlled expanded node IDs */
  expanded?: string[]
  /** Initially selected node IDs */
  defaultSelected?: string[]
  /** Controlled selected node IDs */
  selected?: string[]
  /** Enable multi-select */
  multiSelect?: boolean
  /** Callback when node is selected */
  onSelect?: (nodeId: string, node: TreeNode) => void
  /** Callback when selection changes (multi-select) */
  onSelectionChange?: (nodeIds: string[]) => void
  /** Callback when node is expanded/collapsed */
  onToggle?: (nodeId: string, isExpanded: boolean) => void
  /** Custom expand icon */
  expandIcon?: React.ReactNode
  /** Custom collapse icon */
  collapseIcon?: React.ReactNode
  /** Custom end icon (leaf nodes) */
  endIcon?: React.ReactNode
  /** Additional CSS class */
  className?: string
  /** Dense layout */
  dense?: boolean
}

interface TreeItemProps {
  node: TreeNode
  level: number
  expanded: Set<string>
  selected: Set<string>
  multiSelect: boolean
  onToggleExpand: (nodeId: string) => void
  onSelect: (nodeId: string, node: TreeNode) => void
  expandIcon?: React.ReactNode
  collapseIcon?: React.ReactNode
  endIcon?: React.ReactNode
  dense?: boolean
}

const DefaultExpandIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </svg>
)

const DefaultCollapseIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
  </svg>
)

function TreeItem({
  node,
  level,
  expanded,
  selected,
  multiSelect,
  onToggleExpand,
  onSelect,
  expandIcon,
  collapseIcon,
  endIcon,
  dense,
}: TreeItemProps) {
  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expanded.has(node.id)
  const isSelected = selected.has(node.id)

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (hasChildren) {
        onToggleExpand(node.id)
      }
    },
    [hasChildren, node.id, onToggleExpand]
  )

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      if (!node.disabled) {
        onSelect(node.id, node)
      }
    },
    [node, onSelect]
  )

  const renderIcon = () => {
    if (!hasChildren) {
      return endIcon ? (
        <span className={styles.treeItemIcon}>{endIcon}</span>
      ) : (
        <span className={styles.treeItemIconPlaceholder} />
      )
    }

    return (
      <span className={styles.treeItemIcon} onClick={handleToggle}>
        {isExpanded
          ? collapseIcon || <DefaultCollapseIcon />
          : expandIcon || <DefaultExpandIcon />}
      </span>
    )
  }

  return (
    <li className={styles.treeItem}>
      <div
        className={clsx(styles.treeItemContent, {
          [styles.selected as string]: isSelected,
          [styles.disabled as string]: node.disabled,
          [styles.dense as string]: dense,
        })}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={handleSelect}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-disabled={node.disabled}
        tabIndex={node.disabled ? -1 : 0}
      >
        {renderIcon()}
        {node.icon && <span className={styles.treeItemNodeIcon}>{node.icon}</span>}
        <span className={styles.treeItemLabel}>{node.label}</span>
      </div>
      {hasChildren && isExpanded && (
        <ul className={styles.treeItemChildren} role="group">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              selected={selected}
              multiSelect={multiSelect}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              expandIcon={expandIcon}
              collapseIcon={collapseIcon}
              endIcon={endIcon}
              dense={dense}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

/**
 * TreeView component - Hierarchical tree navigation
 *
 * @example
 * ```tsx
 * const data = [
 *   { id: '1', label: 'Parent', children: [
 *     { id: '1-1', label: 'Child 1' },
 *     { id: '1-2', label: 'Child 2' }
 *   ]}
 * ]
 * <TreeView data={data} onSelect={(id) => console.log(id)} />
 * ```
 */
export function TreeView({
  data,
  defaultExpanded = [],
  expanded: controlledExpanded,
  defaultSelected = [],
  selected: controlledSelected,
  multiSelect = false,
  onSelect,
  onSelectionChange,
  onToggle,
  expandIcon,
  collapseIcon,
  endIcon,
  className,
  dense = false,
}: TreeViewProps) {
  const [internalExpanded, setInternalExpanded] = useState<Set<string>>(
    new Set(defaultExpanded)
  )
  const [internalSelected, setInternalSelected] = useState<Set<string>>(
    new Set(defaultSelected)
  )

  const expanded = useMemo(
    () => (controlledExpanded !== undefined ? new Set(controlledExpanded) : internalExpanded),
    [controlledExpanded, internalExpanded]
  )

  const selected = useMemo(
    () => (controlledSelected !== undefined ? new Set(controlledSelected) : internalSelected),
    [controlledSelected, internalSelected]
  )

  const handleToggleExpand = useCallback(
    (nodeId: string) => {
      const newExpanded = new Set(expanded)
      const isExpanding = !newExpanded.has(nodeId)
      
      if (isExpanding) {
        newExpanded.add(nodeId)
      } else {
        newExpanded.delete(nodeId)
      }

      if (controlledExpanded === undefined) {
        setInternalExpanded(newExpanded)
      }
      
      onToggle?.(nodeId, isExpanding)
    },
    [expanded, controlledExpanded, onToggle]
  )

  const handleSelect = useCallback(
    (nodeId: string, node: TreeNode) => {
      let newSelected: Set<string>

      if (multiSelect) {
        newSelected = new Set(selected)
        if (newSelected.has(nodeId)) {
          newSelected.delete(nodeId)
        } else {
          newSelected.add(nodeId)
        }
      } else {
        newSelected = new Set([nodeId])
      }

      if (controlledSelected === undefined) {
        setInternalSelected(newSelected)
      }

      onSelect?.(nodeId, node)
      onSelectionChange?.(Array.from(newSelected))
    },
    [selected, multiSelect, controlledSelected, onSelect, onSelectionChange]
  )

  return (
    <ul className={clsx(styles.treeView, className)} role="tree" aria-multiselectable={multiSelect}>
      {data.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          level={0}
          expanded={expanded}
          selected={selected}
          multiSelect={multiSelect}
          onToggleExpand={handleToggleExpand}
          onSelect={handleSelect}
          expandIcon={expandIcon}
          collapseIcon={collapseIcon}
          endIcon={endIcon}
          dense={dense}
        />
      ))}
    </ul>
  )
}

export default TreeView
