'use client'

import { Button, TextField, Typography } from '@/m3'
import { useDropdownConfigs } from './use-dropdown-configs'
import { useSmtpConfig } from './use-smtp-config'
import { useConfigUi } from './use-config-ui'
import s from './ConfigTab.module.scss'

export function ConfigTab() {
  const dd = useDropdownConfigs()
  const smtp = useSmtpConfig()
  const ui = useConfigUi()
  const selected = dd.configs.find((c) => c.id === ui.selectedId) ?? dd.configs[0]

  const addList = () => {
    if (!ui.newListName.trim()) return
    ui.setSelectedId(dd.create(ui.newListName)); ui.setNewListName('')
  }
  const addOpt = () => {
    if (!selected || !ui.optLabel.trim()) return
    dd.addOption(selected.id, { label: ui.optLabel.trim(), value: ui.optValue.trim() || ui.optLabel.trim() })
    ui.resetOpt()
  }

  return (
    <div className={s.root}>
      <Typography variant="h6" gutterBottom>Dropdown Lists</Typography>
      <div className={s.grid}>
        <aside className={s.list}>
          <div className={s.addRow}>
            <TextField size="small" label="New list" value={ui.newListName}
              onChange={(e) => { ui.setNewListName(e.target.value) }}
              onKeyDown={(e) => { if (e.key === 'Enter') addList() }} />
            <Button size="small" variant="contained" onClick={addList}>+</Button>
          </div>
          {dd.configs.map((c) => (
            <div key={c.id} className={`${s.item} ${c.id === selected?.id ? s.active : ''}`}
              onClick={() => { ui.setSelectedId(c.id) }}>
              <span className={s.itemName}>{c.name}</span>
              <span className={s.count}>{c.options.length}</span>
              <button className={s.del} onClick={(e) => { e.stopPropagation(); dd.remove(c.id) }}>✕</button>
            </div>
          ))}
        </aside>

        <section className={s.editor}>
          {selected ? (
            <>
              <TextField size="small" fullWidth label="List name" value={selected.name}
                onChange={(e) => { dd.rename(selected.id, e.target.value) }} />
              <div className={s.head}>Options</div>
              {selected.options.map((o, i) => (
                <div key={i} className={s.optRow}>
                  <span className={s.optLabel}>{o.label}</span>
                  <span className={s.optValue}>{o.value}</span>
                  <button className={s.del} onClick={() => { dd.removeOption(selected.id, i) }}>✕</button>
                </div>
              ))}
              <div className={s.addOpt}>
                <TextField size="small" label="Label" value={ui.optLabel}
                  onChange={(e) => { ui.setOptLabel(e.target.value) }} />
                <TextField size="small" label="Value" value={ui.optValue}
                  onChange={(e) => { ui.setOptValue(e.target.value) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') addOpt() }} />
                <Button size="small" variant="outlined" onClick={addOpt}>Add</Button>
              </div>
            </>
          ) : <Typography variant="body2" color="text.secondary">Create a list.</Typography>}
        </section>
      </div>

      <div className={s.smtpSection}>
        <div className={s.smtpHead}>
          <Typography variant="h6">Email (SMTP)</Typography>
          <span className={s.spacer} />
          {smtp.dirty && <span className={s.dot} />}
          <Button variant="contained" size="small" disabled={!smtp.dirty || smtp.publishing}
            onClick={() => { void smtp.publish() }}>
            {smtp.publishing ? 'Publishing…' : '⇧ Publish'}
          </Button>
        </div>
        <div className={s.smtpGrid}>
          <TextField size="small" label="Host" value={smtp.config.host}
            onChange={(e) => { smtp.set('host', e.target.value) }} />
          <TextField size="small" label="Port" value={String(smtp.config.port)}
            onChange={(e) => { smtp.set('port', Number(e.target.value) || 0) }} />
          <TextField size="small" label="Username" value={smtp.config.username}
            onChange={(e) => { smtp.set('username', e.target.value) }} />
          <TextField size="small" label="Password" value={smtp.config.password}
            onChange={(e) => { smtp.set('password', e.target.value) }} />
          <TextField size="small" label="From email" value={smtp.config.fromEmail}
            onChange={(e) => { smtp.set('fromEmail', e.target.value) }} />
          <TextField size="small" label="From name" value={smtp.config.fromName}
            onChange={(e) => { smtp.set('fromName', e.target.value) }} />
        </div>
      </div>
    </div>
  )
}
