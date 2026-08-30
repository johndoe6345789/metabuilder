'use client'

import { toCssText } from '../style-controls'
import type { CssClass } from '../use-css-classes'
import { StylePreview } from './StylePreview'
import s from '../CssClassesTab.module.scss'

export interface ClassPreviewPanelProps {
  selected: CssClass | undefined
}

export function ClassPreviewPanel({ selected }: ClassPreviewPanelProps) {
  return (
    <section className={s.previewWrap}>
      <div className={s.previewTitle}>Preview</div>
      {selected === undefined ? (
        <div className={s.preview} />
      ) : (
        <StylePreview id={selected.id} css={selected.props} />
      )}
      <details className={s.codeWrap}>
        <summary className={s.codeSummary}>Show the CSS</summary>
        <pre className={s.code}>
          {selected === undefined
            ? ''
            : `.${selected.name} {\n${toCssText(selected.props)}\n}`}
        </pre>
      </details>
    </section>
  )
}
