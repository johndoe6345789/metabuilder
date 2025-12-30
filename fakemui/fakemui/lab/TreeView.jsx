import React, { useState, createContext, useContext, forwardRef } from 'react'
import { classNames } from '../utils/classNames'

// Context for tree state
const TreeViewContext = createContext({
  expanded: [],
  selected: [],
  multiSelect: false,
  onNodeToggle: () => {},
  onNodeSelect: () => {},
})

/**
 * TreeView - A hierarchical list component
 */
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
  onNodeToggle,
  onNodeSelect,
  disableSelection = false,
  className,
  ...props
}) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const [internalSelected, setInternalSelected] = useState(
    Array.isArray(defaultSelected) ? defaultSelected : [defaultSelected]
  )

  const expanded = controlledExpanded ?? internalExpanded
  const selected = controlledSelected ?? internalSelected

  const handleNodeToggle = (event, nodeId) => {
    const newExpanded = expanded.includes(nodeId)
      ? expanded.filter((id) => id !== nodeId)
      : [...expanded, nodeId]

    if (controlledExpanded === undefined) {
      setInternalExpanded(newExpanded)
    }
    onNodeToggle?.(event, newExpanded)
  }

  const handleNodeSelect = (event, nodeId) => {
    if (disableSelection) return

    let newSelected
    if (multiSelect) {
      newSelected = selected.includes(nodeId)
        ? selected.filter((id) => id !== nodeId)
        : [...selected, nodeId]
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
        onNodeToggle: handleNodeToggle,
        onNodeSelect: handleNodeSelect,
        defaultCollapseIcon,
        defaultEndIcon,
        defaultExpandIcon,
        defaultParentIcon,
      }}
    >
      <ul
        className={classNames('fakemui-tree-view', className)}
        role="tree"
        aria-multiselectable={multiSelect}
        {...props}
      >
        {children}
      </ul>
    </TreeViewContext.Provider>
  )
}

/**
 * TreeItem - A single item in the tree
 */
export const TreeItem = forwardRef(function TreeItem(
  {
    nodeId,
    label,
    children,
    icon,
    expandIcon,
    collapseIcon,
    endIcon,
    disabled = false,
    className,
    ContentComponent,
    ContentProps = {},
    ...props
  },
  ref
) {
  const {
    expanded,
    selected,
    onNodeToggle,
    onNodeSelect,
    defaultCollapseIcon,
    defaultEndIcon,
    defaultExpandIcon,
  } = useContext(TreeViewContext)

  const isExpanded = expanded.includes(nodeId)
  const isSelected = selected.includes(nodeId)
  const hasChildren = React.Children.count(children) > 0

  const handleClick = (event) => {
    if (disabled) return
    onNodeSelect(event, nodeId)
  }

  const handleExpandClick = (event) => {
    event.stopPropagation()
    if (disabled) return
    onNodeToggle(event, nodeId)
  }

  const displayIcon = hasChildren
    ? isExpanded
      ? collapseIcon || defaultCollapseIcon || '▼'
      : expandIcon || defaultExpandIcon || '▶'
    : endIcon || defaultEndIcon || null

  return (
    <li
      ref={ref}
      className={classNames('fakemui-tree-item', className, {
        'fakemui-tree-item-expanded': isExpanded,
        'fakemui-tree-item-selected': isSelected,
        'fakemui-tree-item-disabled': disabled,
      })}
      role="treeitem"
      aria-expanded={hasChildren ? isExpanded : undefined}
      aria-selected={isSelected}
      aria-disabled={disabled}
      {...props}
    >
      <div
        className="fakemui-tree-item-content"
        onClick={handleClick}
        {...ContentProps}
      >
        {hasChildren && (
          <span
            className="fakemui-tree-item-icon-container"
            onClick={handleExpandClick}
          >
            {displayIcon}
          </span>
        )}
        {!hasChildren && displayIcon && (
          <span className="fakemui-tree-item-icon-container">{displayIcon}</span>
        )}
        {icon && <span className="fakemui-tree-item-icon">{icon}</span>}
        <span className="fakemui-tree-item-label">{label}</span>
      </div>
      {hasChildren && isExpanded && (
        <ul className="fakemui-tree-item-group" role="group">
          {children}
        </ul>
      )}
    </li>
  )
})

export default TreeView
