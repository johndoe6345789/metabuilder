import React from 'react'

export interface ClickAwayListenerProps {
  children: React.ReactNode
  onClickAway?: (event: MouseEvent) => void
}

export const ClickAwayListener: React.FC<ClickAwayListenerProps> = ({ children, onClickAway }) => {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClickAway?.(e)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClickAway])
  return <div ref={ref}>{children}</div>
}
