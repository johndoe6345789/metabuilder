'use client'

import { useState } from 'react'
import { useComponentTree } from './useComponentTree'
import { TreePanel } from './TreePanel'
import { CatalogPanel } from './CatalogPanel'
import { ConfigDialog } from './ConfigDialog'
import { COMPONENT_CATALOG } from './component-catalog'
import type { ComponentDef } from './types'
import s from './ComponentHierarchyEditor.module.scss'

export function ComponentHierarchyEditor() {
  const tree = useComponentTree()
  const [configNodeId, setConfigNodeId] = useState<string | null>(null)

  function handleAddFromCatalog(def: ComponentDef) {
    tree.addNode(def, tree.selectedNodeId)
  }

  const configNode =
    configNodeId != null
      ? tree.nodes.find(n => n.id === configNodeId) ?? null
      : null

  const configDef =
    configNode != null
      ? COMPONENT_CATALOG.find(d => d.type === configNode.type) ?? null
      : null

  return (
    <div className={s.root}>
      <div className={s.treePane}>
        <TreePanel
          nodes={tree.nodes}
          pages={tree.pages}
          selectedPage={tree.selectedPage}
          selectedNodeId={tree.selectedNodeId}
          expandedIds={tree.expandedIds}
          onPageChange={tree.setSelectedPage}
          onSelect={tree.selectNode}
          onToggle={tree.toggleExpand}
          onRemove={tree.removeNode}
          onConfig={id => { setConfigNodeId(id) }}
          onMove={tree.moveNode}
        />
      </div>

      <div className={s.catalogPane}>
        <CatalogPanel
          selectedNodeId={tree.selectedNodeId}
          onAdd={handleAddFromCatalog}
        />
      </div>

      {configNode != null && configDef != null && (
        <ConfigDialog
          node={configNode}
          onClose={() => { setConfigNodeId(null) }}
          onSave={(props, styles) => {
            tree.updateNode(configNode.id, props, styles)
            setConfigNodeId(null)
          }}
        />
      )}
    </div>
  )
}
