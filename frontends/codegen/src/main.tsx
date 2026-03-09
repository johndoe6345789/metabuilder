import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import { APP_CONFIG } from './config/app.config.ts'
import AppTabs from './App.tsx'
import AppRouter from './App.router.tsx'

const App = APP_CONFIG.useRouter ? AppRouter : AppTabs

import { ErrorFallback } from './ErrorFallback.tsx'
import { Toaster } from './components/ui/sonner.tsx'
import { TooltipProvider } from './components/ui/tooltip.tsx'

import "./main.scss"
import "./styles/theme.scss"
import "./index.scss"

import { startPerformanceMonitoring } from './lib/bundle-metrics'

const isResizeObserverError = (message: string | undefined): boolean => {
  if (!message) return false
  return (
    message.includes('ResizeObserver loop') ||
    (message.includes('ResizeObserver') && message.includes('notifications'))
  )
}

const originalError = console.error
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    isResizeObserverError(args[0])
  ) {
    return
  }
  originalError.call(console, ...args)
}

const originalWarn = console.warn
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    isResizeObserverError(args[0])
  ) {
    return
  }
  originalWarn.call(console, ...args)
}

window.addEventListener('error', (e) => {
  if (isResizeObserverError(e.message)) {
    e.stopImmediatePropagation()
    e.preventDefault()
    return false
  }
}, true)

window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && e.reason.message && isResizeObserverError(e.reason.message)) {
    e.preventDefault()
    return false
  }
})

startPerformanceMonitoring()

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

const root = createRoot(rootElement)

root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <TooltipProvider>
      <App />
      <Toaster />
    </TooltipProvider>
   </ErrorBoundary>
)
