'use client'

import { Button, TextField, Typography } from '@/m3'
import { useCssClasses } from './use-css-classes'
import { useCssUi } from './use-css-ui'
import { StyleVisualEditor } from './StyleVisualEditor'
import { toClassName, toCssText } from './style-controls'
import s from './CssClassesTab.module.scss'

/**
 * What a style looks like applied to something.
 *
 * Rendered as a real stylesheet rule rather than an inline style object:
 * React ignores hyphenated keys in `style`, so half of every rule -- the half
 * written as actual CSS -- was silently dropped and the preview showed a
 * style nobody would get. A rule in a <style> tag is also exactly what the
 * published page will use.
 */
function StylePreview({ id, css }: { id: string; css: Record<string, string> }) {
  const scope = `sp-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <div className={s.preview}>
      <style>{`.${scope} {\n${toCssText(css)}\n}`}</style>
      <div className={scope}>The quick brown fox jumps over the lazy dog.</div>
    </div>
  )
}

export function CssClassesTab() {
  const css = useCssClasses()
  const ui = useCssUi()
  const selected =
    css.classes.find(c => c.id === ui.selectedId) ?? css.classes[0]

  const addClass = () => {
    if (ui.newName.trim() === '') return
    ui.setSelectedId(css.create(toClassName(ui.newName)))
    ui.setNewName('')
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
              label="New style"
              placeholder="Big red heading"
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
              <span className={s.dotClass}>{c.name}</span>
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
                label="Style name"
                value={selected.name}
                helperText={`Applied to a component as "${selected.name}"`}
                onChange={e => {
                  css.rename(selected.id, e.target.value)
                }}
                onBlur={e => {
                  // Tidied on the way out rather than as they type, so the
                  // field does not fight the person using it.
                  css.rename(selected.id, toClassName(e.target.value))
                }}
              />

              <StyleVisualEditor
                props={selected.props}
                onSet={(prop, value) => {
                  css.setProp(selected.id, prop, value)
                }}
                onClear={prop => {
                  css.removeProp(selected.id, prop)
                }}
              />
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Name a style above to start. A style is a look you can reuse —
              give it a name, set how it should look, then apply it to any
              component in the builder.
            </Typography>
          )}
        </section>

        <section className={s.previewWrap}>
          <div className={s.previewTitle}>Preview</div>
          {selected ? (
            <StylePreview id={selected.id} css={selected.props} />
          ) : (
            <div className={s.preview} />
          )}
          <details className={s.codeWrap}>
            <summary className={s.codeSummary}>Show the CSS</summary>
            <pre className={s.code}>
              {selected
                ? `.${selected.name} {\n${toCssText(selected.props)}\n}`
                : ''}
            </pre>
          </details>
        </section>
      </div>
    </div>
  )
}
