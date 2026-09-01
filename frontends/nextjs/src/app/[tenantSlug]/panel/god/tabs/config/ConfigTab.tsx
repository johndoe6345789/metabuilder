'use client'

import { Typography } from '@/m3'
import { DropdownEditor } from './config-view/DropdownEditor'
import { DropdownListSidebar } from './config-view/DropdownListSidebar'
import { SmtpEditor } from './config-view/SmtpEditor'
import { useConfigTab } from './use-config-tab'
import s from './ConfigTab.module.scss'

export function ConfigTab() {
  const c = useConfigTab()

  return (
    <div className={s.root}>
      <Typography variant="h6" gutterBottom>
        Dropdown Lists
      </Typography>
      <div className={s.grid}>
        <DropdownListSidebar
          configs={c.dd.configs}
          selectedId={c.selected?.id}
          newListName={c.ui.newListName}
          onNewListNameChange={c.ui.setNewListName}
          onAddList={c.addList}
          onSelect={c.ui.setSelectedId}
          onRemove={c.dd.remove}
        />
        <section className={s.editor}>
          <DropdownEditor
            selected={c.selected}
            optLabel={c.ui.optLabel}
            optValue={c.ui.optValue}
            onRename={name => {
              if (c.selected !== undefined) c.dd.rename(c.selected.id, name)
            }}
            onRemoveOption={index => {
              if (c.selected !== undefined) {
                c.dd.removeOption(c.selected.id, index)
              }
            }}
            onOptLabelChange={c.ui.setOptLabel}
            onOptValueChange={c.ui.setOptValue}
            onAddOption={c.addOpt}
          />
        </section>
      </div>

      <SmtpEditor
        config={c.smtp.config}
        dirty={c.smtp.dirty}
        publishing={c.smtp.publishing}
        onChange={c.smtp.set}
        onPublish={() => {
          void c.smtp.publish()
        }}
      />
    </div>
  )
}
