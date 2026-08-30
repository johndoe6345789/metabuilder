'use client'

import { useCssClasses } from './use-css-classes'
import { useCssUi } from './use-css-ui'
import { PublishBar } from './css-classes/PublishBar'
import { ClassListPanel } from './css-classes/ClassListPanel'
import { ClassEditorPanel } from './css-classes/ClassEditorPanel'
import { ClassPreviewPanel } from './css-classes/ClassPreviewPanel'
import { useSelectedClass } from './css-classes/use-selected-class'
import s from './CssClassesTab.module.scss'

export function CssClassesTab() {
  const css = useCssClasses()
  const ui = useCssUi()
  const { selected, addClass } = useSelectedClass({
    classes: css.classes,
    selectedId: ui.selectedId,
    newName: ui.newName,
    onCreate: css.create,
    onSelect: ui.setSelectedId,
    onNewNameChange: ui.setNewName,
  })

  return (
    <div className={s.root}>
      <PublishBar
        dirty={css.dirty}
        publishing={css.publishing}
        onPublish={() => {
          void css.publish()
        }}
      />

      <div className={s.grid}>
        <ClassListPanel
          classes={css.classes}
          selectedId={selected?.id}
          newName={ui.newName}
          onNewNameChange={ui.setNewName}
          onAdd={addClass}
          onSelect={ui.setSelectedId}
          onRemove={css.remove}
        />

        <ClassEditorPanel
          selected={selected}
          onRename={css.rename}
          onSetProp={css.setProp}
          onClearProp={css.removeProp}
        />

        <ClassPreviewPanel selected={selected} />
      </div>
    </div>
  )
}
