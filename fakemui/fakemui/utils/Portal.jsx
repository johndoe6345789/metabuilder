import React from 'react'
import ReactDOM from 'react-dom'

export const Portal = ({ children, container }) => {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return ReactDOM.createPortal(children, container || document.body)
}
