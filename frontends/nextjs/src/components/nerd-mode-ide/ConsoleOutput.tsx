'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/m3'
import s from './ConsoleOutput.module.scss'

interface ConsoleOutputProps {
  lines: string[]
}

export function ConsoleOutput({ lines }: ConsoleOutputProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [localLines, setLocalLines] = useState<string[]>(lines)

  // Mirrors the `lines` prop into local state so Clear can diverge from
  // it, then re-syncs on the next real change. Adjusted during render
  // (the documented React pattern for state that tracks a prop) instead
  // of an effect, comparing by reference since `lines` only gets a new
  // array when the parent actually appends output.
  const [prevLines, setPrevLines] = useState(lines)
  if (lines !== prevLines) {
    setPrevLines(lines)
    setLocalLines(lines)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localLines])

  return (
    <div className={s.wrap}>
      <div className={s.toolbar}>
        <span className={s.label}>Console</span>
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setLocalLines([])
          }}
        >
          Clear
        </Button>
      </div>
      <div className={s.output}>
        {localLines.length === 0 ? (
          <span className={s.empty}>No output</span>
        ) : (
          localLines.map((line, i) => (
            <div key={i} className={s.line}>
              {line}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
