console.log('[INIT] 🚀 main.tsx starting - BEGIN')
console.time('[INIT] Total initialization time')

console.log('[INIT] 📦 Importing React DOM')
import { createRoot } from 'react-dom/client'
console.log('[INIT] ✅ React DOM imported')

console.log('[INIT] 📦 Importing ErrorBoundary')
import { ErrorBoundary } from "react-error-boundary";
console.log('[INIT] ✅ ErrorBoundary imported')

console.log('[INIT] 📦 Importing Spark SDK')
import '@/lib/spark-runtime'
console.log('[INIT] ✅ Spark SDK imported')

console.log('[INIT] 📦 Importing App component')
import { APP_CONFIG } from './config/app.config.ts'
import AppTabs from './App.tsx'
import AppRouter from './App.router.tsx'

const App = APP_CONFIG.useRouter ? AppRouter : AppTabs
console.log('[INIT] ✅ App component imported - Mode:', APP_CONFIG.useRouter ? 'Router' : 'Tabs')

console.log('[INIT] 📦 Importing ErrorFallback')
import { ErrorFallback } from './ErrorFallback.tsx'
console.log('[INIT] ✅ ErrorFallback imported')

console.log('[INIT] 📦 Importing UI components')
import { Toaster } from './components/ui/sonner.tsx'
import { TooltipProvider } from './components/ui/tooltip.tsx'
console.log('[INIT] ✅ UI components imported')

console.log('[INIT] 🎨 Loading CSS files')
import "./main.css"
console.log('[INIT] ✅ main.css loaded')
import "./styles/theme.css"
console.log('[INIT] ✅ theme.css loaded')
import "./index.css"
console.log('[INIT] ✅ index.css loaded')

console.log('[INIT] 📊 Importing bundle metrics')
import { startPerformanceMonitoring } from './lib/bundle-metrics'
console.log('[INIT] ✅ Bundle metrics imported')

console.log('[INIT] 🛡️ Setting up error handlers')

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
  console.log('[INIT] ⚠️ Global error caught:', e.message)
  if (isResizeObserverError(e.message)) {
    e.stopImmediatePropagation()
    e.preventDefault()
    return false
  }
}, true)

window.addEventListener('unhandledrejection', (e) => {
  console.log('[INIT] ⚠️ Unhandled rejection caught:', e.reason)
  if (e.reason && e.reason.message && isResizeObserverError(e.reason.message)) {
    e.preventDefault()
    return false
  }
})

console.log('[INIT] ✅ Error handlers configured')

console.log('[INIT] 🔍 Starting performance monitoring')
startPerformanceMonitoring()
console.log('[INIT] ✅ Performance monitoring started')

console.log('[INIT] 🎯 Finding root element')
const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('[INIT] ❌ Root element not found!')
  throw new Error('Root element not found')
}
console.log('[INIT] ✅ Root element found:', rootElement)

console.log('[INIT] 🏗️ Creating React root')
const root = createRoot(rootElement)
console.log('[INIT] ✅ React root created')

console.log('[INIT] 🎨 Rendering application')
root.render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <TooltipProvider>
      <App />
      <Toaster />
    </TooltipProvider>
   </ErrorBoundary>
)
console.log('[INIT] ✅ Application rendered')
console.timeEnd('[INIT] Total initialization time')
console.log('[INIT] 🎉 main.tsx complete - END')
