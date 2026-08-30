'use client'

import { ComponentTreePublishBar } from './ComponentTreePublishBar'
import { useWorkbench } from './use-workbench'
import { HistoryControls } from './workbench/HistoryControls'
import { MiddlePanes } from './workbench/MiddlePanes'
import { PaneTabs } from './workbench/PaneTabs'
import { PalettePane } from './workbench/PalettePane'
import { PreviewPane } from './workbench/PreviewPane'
import { SetupPanel } from './workbench/SetupPanel'
import s from './ComponentTreeTab.module.scss'

export function ComponentTreeWorkbench() {
  const w = useWorkbench()

  return (
    <div className={s.root}>
      <SetupPanel
        open={w.setupOpen}
        onToggle={w.toggleSetup}
        target={w.target}
        trees={w.trees}
        currentTree={w.currentTree}
        pages={w.pages}
        loading={w.t.loading}
        onBlank={w.t.resetTree}
        onPickTree={w.targetActions.pick}
        onPickRoute={w.targetActions.pick}
        onChange={w.targetActions.change}
        onLoad={w.targetActions.load}
      />

      {w.t.conflict !== null && (
        <div className={s.conflict} role="alert">
          {w.t.conflict}
        </div>
      )}

      <ComponentTreePublishBar
        path={w.target.path}
        tenant={w.tenant}
        dirty={w.t.dirty}
        publishing={w.t.publishing}
        onPublish={() => {
          void w.t.publish(w.target)
        }}
      />

      <HistoryControls
        canUndo={w.t.canUndo}
        canRedo={w.t.canRedo}
        onUndo={w.t.undo}
        onRedo={w.t.redo}
      />

      <PaneTabs view={w.view} onChange={w.setView} />

      <div className={s.grid} data-view={w.view}>
        <PalettePane onAdd={w.t.addNode} />
        <MiddlePanes
          t={w.t}
          tenant={w.tenant}
          collapsed={w.collapsed}
          onToggleCollapse={w.toggleCollapse}
          duplicateId={w.duplicateId}
        />
        <PreviewPane tree={w.t.tree} />
      </div>
    </div>
  )
}
