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

  useEffect(() => {
    setLocalLines(lines)
  }, [lines])

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
          onClick={() => { setLocalLines([]) }}
        >
          Clear
        </Button>
      </div>
      <div className={s.output}>
        {localLines.length === 0 ? (
          <span className={s.empty}>No output</span>
        ) : (
          localLines.map((line, i) => (
            <div key={i} className={s.line}>{line}</div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
