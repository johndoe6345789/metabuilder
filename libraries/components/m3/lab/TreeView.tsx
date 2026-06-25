'use client'

import React, { useState, createContext, useContext, forwardRef } from 'react'
import { classNames } from '../utils/classNames'
import styles from '../../../scss/TreeView.module.scss'

interface TreeViewContextType {
  expanded: string[]
  selected: string[]
  multiSelect: boolean
  dense: boolean
  onNodeToggle: (event: React.SyntheticEvent, nodeId: string) => void
  onNodeSelect: (event: React.SyntheticEvent, nodeId: string) => void
  defaultCollapseIcon?: React.ReactNode
  defaultEndIcon?: React.ReactNode
  defaultExpandIcon?: React.ReactNode
  defaultParentIcon?: React.ReactNode
}

const TreeViewContext = createContext<TreeViewContextType>({
  expanded: [],
  selected: [],
  multiSelect: false,
  dense: false,
  onNodeToggle: () => {},
  onNodeSelect: () => {},
})

export interface TreeViewProps extends React.HTMLAttributes<HTMLUListElement> {
  children?: React.ReactNode
  defaultCollapseIcon?: React.ReactNode
  defaultEndIcon?: React.ReactNode
  defaultExpandIcon?: React.ReactNode
  defaultParentIcon?: React.ReactNode
  expanded?: string[]
  defaultExpanded?: string[]
  selected?: string | string[]
  defaultSelected?: string | string[]
  multiSelect?: boolean
  dense?: boolean
  onNodeToggle?: (event: React.SyntheticEvent, nodeIds: string[]) => void
  onNodeSelect?: (event: React.SyntheticEvent, nodeIds: string | string[]) => void
  disableSelection?: boolean
  /** Test ID for automated testing */
  testId?: string
}

export function TreeView({
  children,
  defaultCollapseIcon,
  defaultEndIcon,
  defaultExpandIcon,
  defaultParentIcon,
  expanded: controlledExpanded,
  defaultExpanded = [],
  selected: controlledSelected,
  defaultSelected = [],
  multiSelect = false,
  dense = false,
  onNodeToggle,
  onNodeSelect,
  disableSelection = false,
  className,
  testId,
  ...props
}: TreeViewProps) {
  const [internalExpanded, setInternalExpanded] = useState<string[]>(defaultExpanded)
  const [internalSelected, setInternalSelected] = useState<string[]>(
    Array.isArray(defaultSelected) ? defaultSelected : [defaultSelected]
  )

  const expanded = controlledExpanded ?? internalExpanded
  const selected = controlledSelected ?? internalSelected

  const handleNodeToggle = (event: React.SyntheticEvent, nodeId: string) => {
    const newExpanded = expanded.includes(nodeId) ? expanded.filter((id) => id !== nodeId) : [...expanded, nodeId]

    if (controlledExpanded === undefined) {
      setInternalExpanded(newExpanded)
    }
    onNodeToggle?.(event, newExpanded)
  }

  const handleNodeSelect = (event: React.SyntheticEvent, nodeId: string) => {
    if (disableSelection) return

    let newSelected: string[]
    if (multiSelect) {
      newSelected = (Array.isArray(selected) ? selected : [selected]).includes(nodeId)
        ? (Array.isArray(selected) ? selected : [selected]).filter((id) => id !== nodeId)
        : [...(Array.isArray(selected) ? selected : [selected]), nodeId]
    } else {
      newSelected = [nodeId]
    }

    if (controlledSelected === undefined) {
      setInternalSelected(newSelected)
    }
    onNodeSelect?.(event, multiSelect ? newSelected : nodeId)
  }

  return (
    <TreeViewContext.Provider
      value={{
        expanded,
        selected: Array.isArray(selected) ? selected : [selected],
        multiSelect,
        dense,
        onNodeToggle: handleNodeToggle,
        onNodeSelect: handleNodeSelect,
        defaultCollapseIcon,
        defaultEndIcon,
        defaultExpandIcon,
        defaultParentIcon,
      }}
    >
      <ul className={classNames(styles.treeView, className)} role="tree" aria-multiselectable={multiSelect} data-testid={testId} {...props}>
        {children}
      </ul>
    </TreeViewContext.Provider>
  )
}

export interface TreeItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  nodeId: string
  label?: React.ReactNode
  children?: React.ReactNode
  icon?: React.ReactNode
  expandIcon?: React.ReactNode
  collapseIcon?: React.ReactNode
  endIcon?: React.ReactNode
  disabled?: boolean
  ContentComponent?: React.ElementType
  ContentProps?: any
}

export const TreeItem = forwardRef<HTMLLIElement, TreeItemProps>(function TreeItem(
  { nodeId, label, children, icon, expandIcon, collapseIcon, endIcon, disabled = false, className, ContentComponent, ContentProps = {}, ...props },
  ref
) {
  const { expanded, selected, dense, onNodeToggle, onNodeSelect, defaultCollapseIcon, defaultEndIcon, defaultExpandIcon } =
    useContext(TreeViewContext)

  const isExpanded = expanded.includes(nodeId)
  const isSelected = selected.includes(nodeId)
  const hasChildren = React.Children.count(children) > 0

  const handleClick = (event: React.MouseEvent) => {
    if (disabled) return
    onNodeSelect(event, nodeId)
  }

  const handleExpandClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (disabled) return
    onNodeToggle(event, nodeId)
  }

  const displayIcon = hasChildren
    ? isExpanded
      ? collapseIcon || defaultCollapseIcon || '▼'
      : expandIcon || defaultExpandIcon || '▶'
    : endIcon || defaultEndIcon || null

  const contentClasses = classNames(styles.treeItemContent, {
    [styles.selected]: isSelected,
    [styles.disabled]: disabled,
    [styles.dense]: dense,
  })

  return (
    <li
      ref={ref}
      className={classNames(styles.treeItem, className)}
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-disabled={disabled}
      {...props}
    >
      <div className={contentClasses} onClick={handleClick} {...ContentProps}>
        {hasChildren && (
          <span className={styles.treeItemIcon} onClick={handleExpandClick}>
            {displayIcon}
          </span>
        )}
        {!hasChildren && displayIcon && <span className={styles.treeItemIcon}>{displayIcon}</span>}
        {!hasChildren && !displayIcon && <span className={styles.treeItemIconPlaceholder} />}
        {icon && <span className={styles.treeItemNodeIcon}>{icon}</span>}
        <span className={styles.treeItemLabel}>{label}</span>
      </div>
      {hasChildren && isExpanded && (
        <ul className={styles.treeItemChildren} role="group">
          {children}
        </ul>
      )}
    </li>
  )
})

export default TreeView
