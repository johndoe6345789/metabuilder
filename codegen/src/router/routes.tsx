import { lazy, Suspense } from 'react'
import { RouteObject, Navigate } from 'react-router-dom'
import { JSONSchemaPageLoader } from '@/components/JSONSchemaPageLoader'
import { NotFoundPage } from '@/components/NotFoundPage'
import { getEnabledPages, resolveProps } from '@/config/page-loader'
import { ComponentRegistry } from '@/lib/component-registry'
import { PageRenderer } from '@/lib/json-ui/page-renderer'
import { FeatureToggles } from '@/types/project'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

console.log('[ROUTES] 🛣️ Routes configuration loading')

const LazyComponent = ({ 
  componentName, 
  props 
}: { 
  componentName: string
  props: any 
}) => {
  console.log('[ROUTES] 🎨 Rendering lazy component:', componentName)
  const Component = ComponentRegistry[componentName as keyof typeof ComponentRegistry] as any
  
  if (!Component) {
    console.error('[ROUTES] ❌ Component not found:', componentName)
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-sm text-muted-foreground">Component {componentName} not found</p>
      </div>
    )
  }
  
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading {componentName.toLowerCase()}...</p>
        </div>
      </div>
    }>
      <Component {...props} />
    </Suspense>
  )
}

const ResizableLayout = ({
  leftComponent,
  rightComponent,
  leftProps,
  rightProps,
  config
}: any) => {
  console.log('[ROUTES] 🔀 Rendering resizable layout')
  const LeftComponent = ComponentRegistry[leftComponent as keyof typeof ComponentRegistry] as any
  const RightComponent = ComponentRegistry[rightComponent as keyof typeof ComponentRegistry] as any

  if (!LeftComponent || !RightComponent) {
    console.error('[ROUTES] ❌ Resizable components not found:', { leftComponent, rightComponent })
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-sm text-muted-foreground">Layout components not found</p>
      </div>
    )
  }

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel 
        defaultSize={config.leftPanel.defaultSize} 
        minSize={config.leftPanel.minSize} 
        maxSize={config.leftPanel.maxSize}
      >
        <Suspense fallback={<LoadingFallback message={`Loading ${leftComponent.toLowerCase()}...`} />}>
          <LeftComponent {...leftProps} />
        </Suspense>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={config.rightPanel.defaultSize}>
        <Suspense fallback={<LoadingFallback message={`Loading ${rightComponent.toLowerCase()}...`} />}>
          <RightComponent {...rightProps} />
        </Suspense>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export function createRoutes(
  featureToggles: FeatureToggles,
  stateContext: any,
  actionContext: any
): RouteObject[] {
  console.log('[ROUTES] 🏗️ Creating routes with feature toggles:', featureToggles)
  const enabledPages = getEnabledPages(featureToggles)
  console.log('[ROUTES] 📄 Enabled pages count:', enabledPages.length)
  console.log('[ROUTES] 📄 Enabled page IDs:', enabledPages.map(p => p.id).join(', '))
  console.log('[ROUTES] 📄 Enabled pages details:', JSON.stringify(enabledPages.map(p => ({ 
    id: p.id, 
    component: p.component, 
    isRoot: p.isRoot,
    enabled: p.enabled 
  })), null, 2))

  const rootPage = enabledPages.find(p => p.isRoot)
  console.log('[ROUTES] 🏠 Root page search result:', rootPage ? `Found: ${rootPage.id} (${rootPage.component})` : 'NOT FOUND - will redirect to /dashboard')

  // JSON page prop contract: page.props.data maps to stateContext -> data bindings,
  // page.props.functions maps to actionContext -> custom action handlers.
  // The mapping syntax matches props.state/props.actions (propName[:contextKey]).
  const renderJsonPage = (
    page: typeof enabledPages[number],
    data?: Record<string, any>,
    functions?: Record<string, any>
  ) => {
    if (page.schema) {
      console.log('[ROUTES] 🧾 Rendering preloaded JSON schema for page:', page.id)
      return <PageRenderer schema={page.schema} data={data} functions={functions} />
    }

    if (page.schemaPath) {
      console.log('[ROUTES] 🧾 Rendering JSON schema loader for page:', page.id)
      return <JSONSchemaPageLoader schemaPath={page.schemaPath} data={data} functions={functions} />
    }

    console.error('[ROUTES] ❌ JSON page missing schemaPath:', page.id)
    return <LoadingFallback message={`Schema path missing for JSON page: ${page.id}`} />
  }

  const routes: RouteObject[] = enabledPages
    .filter(p => !p.isRoot)
    .map(page => {
      console.log('[ROUTES] 📝 Configuring route for page:', page.id)
      
      const props = page.props 
        ? resolveProps(page.props, stateContext, actionContext)
        : {}

      if (page.type === 'json' || page.schemaPath) {
        const jsonDataConfig = page.props?.data ?? page.props?.state
        const jsonFunctionsConfig = page.props?.functions ?? page.props?.actions
        const jsonData = jsonDataConfig
          ? resolveProps({ state: jsonDataConfig }, stateContext, actionContext)
          : {}
        const jsonFunctions = jsonFunctionsConfig
          ? resolveProps({ actions: jsonFunctionsConfig }, stateContext, actionContext)
          : {}

        return {
          path: `/${page.id}`,
          element: renderJsonPage(page, jsonData, jsonFunctions)
        }
      }

      if (page.requiresResizable && page.resizableConfig) {
        console.log('[ROUTES] 🔀 Page requires resizable layout:', page.id)
        const config = page.resizableConfig
        const leftProps = resolveProps(config.leftProps, stateContext, actionContext)

        if (!page.component) {
          console.error('[ROUTES] ❌ Resizable page missing component:', page.id)
          return {
            path: `/${page.id}`,
            element: <LoadingFallback message={`Component missing for page: ${page.id}`} />
          }
        }

        return {
          path: `/${page.id}`,
          element: (
            <ResizableLayout
              leftComponent={config.leftComponent}
              rightComponent={page.component}
              leftProps={leftProps}
              rightProps={props}
              config={config}
            />
          )
        }
      }

      if (!page.component) {
        console.error('[ROUTES] ❌ Page missing component:', page.id)
        return {
          path: `/${page.id}`,
          element: <LoadingFallback message={`Component missing for page: ${page.id}`} />
        }
      }

      return {
        path: `/${page.id}`,
        element: <LazyComponent componentName={page.component} props={props} />
      }
    })

  if (rootPage) {
    console.log('[ROUTES] ✅ Adding root route from JSON config:', rootPage.component)
    const props = rootPage.props 
      ? resolveProps(rootPage.props, stateContext, actionContext)
      : {}
    
    if (rootPage.type === 'json' || rootPage.schemaPath) {
      const jsonDataConfig = rootPage.props?.data ?? rootPage.props?.state
      const jsonFunctionsConfig = rootPage.props?.functions ?? rootPage.props?.actions
      const jsonData = jsonDataConfig
        ? resolveProps({ state: jsonDataConfig }, stateContext, actionContext)
        : {}
      const jsonFunctions = jsonFunctionsConfig
        ? resolveProps({ actions: jsonFunctionsConfig }, stateContext, actionContext)
        : {}

      routes.push({
        path: '/',
        element: renderJsonPage(rootPage, jsonData, jsonFunctions)
      })
    } else if (!rootPage.component) {
      console.error('[ROUTES] ❌ Root page missing component:', rootPage.id)
      routes.push({
        path: '/',
        element: <LoadingFallback message="Root page component missing" />
      })
    } else {
      routes.push({
        path: '/',
        element: <LazyComponent componentName={rootPage.component} props={props} />
      })
    }
  } else {
    console.log('[ROUTES] ⚠️ No root page in config, redirecting to /dashboard')
    routes.push({
      path: '/',
      element: <Navigate to="/dashboard" replace />
    })
  }

  routes.push({
    path: '*',
    element: <NotFoundPage />
  })

  console.log('[ROUTES] ✅ Routes created:', routes.length, 'routes')
  return routes
}
