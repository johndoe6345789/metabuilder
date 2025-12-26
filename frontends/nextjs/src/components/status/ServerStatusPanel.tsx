import React from 'react'

export function ServerStatusPanel(): JSX.Element {
  return (
    <div className="p-4 border rounded bg-white/50">
      <p className="text-sm text-muted-foreground">Server status unavailable in this build.</p>
    </div>
  )
}
