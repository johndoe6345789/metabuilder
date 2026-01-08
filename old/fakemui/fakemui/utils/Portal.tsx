import React from 'react'
import ReactDOM from 'react-dom'

export interface PortalProps {
  children: React.ReactNode
  container?: HTMLElement
}

export const Portal: React.FC<PortalProps> = ({ children, container }) => {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return ReactDOM.createPortal(children, container || document.body)
}
