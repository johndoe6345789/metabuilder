import React from 'react'

export const ClickAwayListener = ({ children, onClickAway }) => {
  const ref = React.useRef(null)
  React.useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClickAway?.(e)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClickAway])
  return <div ref={ref}>{children}</div>
}
