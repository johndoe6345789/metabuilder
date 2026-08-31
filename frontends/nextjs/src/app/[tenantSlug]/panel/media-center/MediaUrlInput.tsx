'use client'

import s from './page.module.scss'

export interface MediaUrlInputProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  onLoad: () => void
}

/** The URL field + Load button shared by the video and audio demos --
 *  each demo owns what "loading" means (which player it mounts). */
export function MediaUrlInput({
  placeholder,
  value,
  onChange,
  onLoad,
}: MediaUrlInputProps) {
  return (
    <div className={s.urlRow}>
      <input
        className={s.urlInput}
        type="url"
        placeholder={placeholder}
        value={value}
        onChange={e => {
          onChange(e.target.value)
        }}
      />
      <button
        className={s.loadBtn}
        onClick={onLoad}
        disabled={value.trim().length === 0}
      >
        Load
      </button>
    </div>
  )
}
