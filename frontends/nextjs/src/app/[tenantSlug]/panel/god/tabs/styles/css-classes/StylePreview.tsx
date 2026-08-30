'use client'

import { toCssText } from '../style-controls'
import { contrastFails } from './contrast-preview'
import { useContrastCheck } from './use-contrast-check'
import s from '../CssClassesTab.module.scss'

/**
 * What a style looks like applied to something.
 *
 * Rendered as a real stylesheet rule rather than an inline style object:
 * React ignores hyphenated keys in `style`, so half of every rule -- the
 * half written as actual CSS -- was silently dropped and the preview
 * showed a style nobody would get. A rule in a <style> tag is also
 * exactly what the published page will use.
 */
export function StylePreview({
  id,
  css,
}: {
  id: string
  css: Record<string, string>
}) {
  const scope = `sp-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`
  const { sample, ratio, floor } = useContrastCheck(css)

  return (
    <>
      <div className={s.preview}>
        <style>{`.${scope} {\n${toCssText(css)}\n}`}</style>
        <div ref={sample} className={scope}>
          The quick brown fox jumps over the lazy dog.
        </div>
      </div>
      {contrastFails(ratio, floor) && (
        <div className={s.contrast} role="status">
          <span className="material-symbols-rounded" aria-hidden="true">
            visibility_off
          </span>
          <span>
            Hard to read — this text is {ratio.toFixed(1)}:1 against its
            background, below the {floor}:1 needed to be legible. Try a
            different text or background colour.
          </span>
        </div>
      )}
    </>
  )
}
