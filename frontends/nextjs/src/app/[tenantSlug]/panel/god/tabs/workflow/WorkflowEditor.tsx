'use client'

import {
  EditorToolbar,
  NodePalette,
  PropertiesDialog,
  type Workflow,
} from '@/workflow-editor'
import { useWorkflowEditor } from './use-workflow-editor'
import { useNodePalette } from './use-node-palette'
import { filterNodeTypes } from './filter-node-types'
import { RUNNABLE_CATEGORIES } from './runnable-steps'
import { WorkflowCanvas } from './WorkflowCanvas'
import s from './WorkflowEditor.module.scss'

interface Props {
  workflow: Workflow
  onChange: (wf: Workflow) => void
  onSave?: (wf: Workflow) => void
  onRun?: (wf: Workflow) => void
  onBack?: () => void
}

export function WorkflowEditor({
  workflow,
  onChange,
  onSave,
  onRun,
  onBack,
}: Props) {
  const { canvasRef, ...ed } = useWorkflowEditor(workflow, onChange)
  const pal = useNodePalette()
  const selectedNodeType =
    ed.selectedNode !== null ? ed.getNodeType(ed.selectedNode.type) : undefined

  return (
    <div className={s.editor}>
      <EditorToolbar
        workflowName={ed.workflow.name}
        onNameChange={ed.setName}
        nodeCount={ed.workflow.nodes.length}
        connectionCount={ed.workflow.connections.length}
        zoom={ed.zoom}
        onZoomIn={ed.zoomIn}
        onZoomOut={ed.zoomOut}
        onZoomReset={ed.zoomReset}
        onBack={() => onBack?.()}
        onSave={() => onSave?.(ed.workflow)}
        onRun={() => onRun?.(ed.workflow)}
      />

      <div className={s.content}>
        <WorkflowCanvas ed={ed} canvasRef={canvasRef} />

        <NodePalette
          nodeSearch={pal.search}
          onSearchChange={pal.setSearch}
          expandedCategories={pal.expanded}
          onToggleCategory={pal.toggle}
          onExpandAll={pal.expandAll}
          onCollapseAll={pal.collapseAll}
          onDragStart={ed.onPaletteDragStart}
          nodeTypes={filterNodeTypes(pal.search)}
          categories={RUNNABLE_CATEGORIES}
        />
      </div>

      <PropertiesDialog
        open={ed.propertiesOpen}
        onClose={() => { ed.setPropertiesOpen(false) }}
        node={ed.selectedNode}
        nodeType={selectedNodeType}
        onUpdateConfig={ed.updateConfig}
        onUpdateName={ed.updateName}
        onDelete={ed.deleteNode}
      />
    </div>
  )
}
