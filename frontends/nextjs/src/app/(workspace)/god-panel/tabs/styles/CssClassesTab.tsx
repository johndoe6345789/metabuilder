'use client'

import { Button, TextField, Typography } from '@/m3'
import { useCssClasses } from './use-css-classes'
import { useCssUi } from './use-css-ui'
import s from './CssClassesTab.module.scss'

export function CssClassesTab() {
  const css = useCssClasses()
  const ui = useCssUi()
  const selected =
    css.classes.find(c => c.id === ui.selectedId) ?? css.classes[0]

  const addClass = () => {
    if (!ui.newName.trim()) return
    ui.setSelectedId(css.create(ui.newName))
    ui.setNewName('')
  }
  const addProp = () => {
    if (!selected || !ui.propKey.trim()) return
    css.setProp(selected.id, ui.propKey.trim(), ui.propVal)
    ui.resetNewProp()
  }

  return (
    <div className={s.root}>
      <div className={s.publishBar}>
        {css.dirty ? <span className={s.dot} /> : null}
        <span className={`${s.status} ${css.dirty ? '' : s.clean}`}>
          {css.dirty
            ? 'Staged changes — not yet published'
            : 'Published — up to date'}
        </span>
        <span className={s.spacer} />
        <Button
          variant="contained"
          size="small"
          disabled={!css.dirty || css.publishing}
          onClick={() => {
            void css.publish()
          }}
        >
          {css.publishing ? 'Publishing…' : '⇧ Publish'}
        </Button>
      </div>

      <div className={s.grid}>
        <aside className={s.list}>
          <div className={s.addRow}>
            <TextField
              size="small"
              label="New class"
              value={ui.newName}
              onChange={e => {
                ui.setNewName(e.target.value)
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') addClass()
              }}
            />
            <Button size="small" variant="contained" onClick={addClass}>
              +
            </Button>
          </div>
          {css.classes.map(c => (
            <div
              key={c.id}
              className={`${s.item} ${c.id === selected?.id ? s.active : ''}`}
              onClick={() => {
                ui.setSelectedId(c.id)
              }}
            >
              <span className={s.dotClass}>.{c.name}</span>
              <button
                className={s.del}
                onClick={e => {
                  e.stopPropagation()
                  css.remove(c.id)
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </aside>

        <section className={s.editor}>
          {selected ? (
            <>
              <TextField
                size="small"
                fullWidth
                label="Class name"
                value={selected.name}
                onChange={e => {
                  css.rename(selected.id, e.target.value)
                }}
              />

              <div className={s.propsHead}>Properties</div>
              {Object.entries(selected.props).map(([k, v]) => (
                <div key={k} className={s.propRow}>
                  <span className={s.propKey}>{k}</span>
                  <TextField
                    size="small"
                    value={v}
                    onChange={e => {
                      css.setProp(selected.id, k, e.target.value)
                    }}
                  />
                  <button
                    className={s.del}
                    onClick={() => {
                      css.removeProp(selected.id, k)
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div className={s.addProp}>
                <TextField
                  size="small"
                  label="property"
                  value={ui.propKey}
                  onChange={e => {
                    ui.setPropKey(e.target.value)
                  }}
                />
                <TextField
                  size="small"
                  label="value"
                  value={ui.propVal}
                  onChange={e => {
                    ui.setPropVal(e.target.value)
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') addProp()
                  }}
                />
                <Button size="small" variant="outlined" onClick={addProp}>
                  Add
                </Button>
              </div>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Create a class to start styling.
            </Typography>
          )}
        </section>

        <section className={s.previewWrap}>
          <div className={s.previewTitle}>Preview</div>
          <div className={s.preview}>
            <div style={selected?.props as React.CSSProperties}>
              .{selected?.name}
            </div>
          </div>
          <pre className={s.code}>
            {selected
              ? `.${selected.name} {\n${Object.entries(selected.props)
                  .map(([k, v]) => `  ${k}: ${v};`)
                  .join('\n')}\n}`
              : ''}
          </pre>
        </section>
      </div>
    </div>
  )
}
