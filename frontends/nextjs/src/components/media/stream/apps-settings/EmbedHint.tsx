'use client'

import s from '../AppsSettingsModal.module.scss'

/** Sets expectations before someone picks "Embed" and finds it blank. */
export function EmbedHint() {
  return (
    <p className={s.hint}>
      Most streaming services block iframe embedding on purpose
      (X-Frame-Options/CSP) — &quot;Embed&quot; will only actually show
      content for services that allow it.
    </p>
  )
}
