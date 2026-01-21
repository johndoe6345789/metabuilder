import { useMemo } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { createRoutes } from './routes'
import { FeatureToggles } from '@/types/project'

console.log('[ROUTER_PROVIDER] 🚀 RouterProvider module loading')

interface RouterProviderProps {
  featureToggles: FeatureToggles
  stateContext: any
  actionContext: any
  children?: React.ReactNode
}

export function RouterProvider({ 
  featureToggles, 
  stateContext, 
  actionContext 
}: RouterProviderProps) {
  console.log('[ROUTER_PROVIDER] 🏗️ RouterProvider rendering')
  console.log('[ROUTER_PROVIDER] 🎛️ Feature toggles:', featureToggles)
  console.log('[ROUTER_PROVIDER] 📦 State context keys:', Object.keys(stateContext))
  console.log('[ROUTER_PROVIDER] 🎬 Action context keys:', Object.keys(actionContext))
  
  const routes = useMemo(() => {
    console.log('[ROUTER_PROVIDER] 🔄 Routes memo updating')
    console.log('[ROUTER_PROVIDER] ⏰ Timestamp:', new Date().toISOString())
    const routeConfigs = createRoutes(featureToggles, stateContext, actionContext)
    console.log('[ROUTER_PROVIDER] ✅ Routes created:', routeConfigs.length, 'routes')
    console.log('[ROUTER_PROVIDER] 📋 Route paths:', routeConfigs.map(r => r.path).join(', '))
    return routeConfigs
  }, [featureToggles, stateContext, actionContext])

  console.log('[ROUTER_PROVIDER] 🎨 Rendering', routes.length, 'routes')
  return (
    <Routes>
      {routes.map((route, index) => {
        console.log('[ROUTER_PROVIDER] 🛣️ Rendering route:', route.path || `index-${index}`)
        return <Route key={route.path || index} path={route.path} element={route.element} />
      })}
    </Routes>
  )
}
