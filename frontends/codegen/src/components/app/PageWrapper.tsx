'use client'

import React, { Suspense } from 'react'
import { getPageById, resolveProps } from '@/config/page-loader'
import { JSONSchemaPageLoader } from '@/components/JSONSchemaPageLoader'
import { PageRenderer } from '@/lib/json-ui/page-renderer'
import { ComponentRegistry } from '@/lib/component-registry'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import useAppProject from '@/hooks/use-app-project'

class PageErrorBoundary extends React.Component<
  { children: React.ReactNode; pageId: string },
  { error: Error | null }
> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ border: '2px solid #ef4444', borderRadius: '8px', padding: '24px', background: '#fef2f2' }}>
            <h2 style={{ color: '#dc2626', fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
              Page Error: {this.props.pageId}
            </h2>
            <p style={{ color: '#991b1b', fontSize: '14px', marginBottom: '12px' }}>
              {this.state.error.message}
            </p>
            <pre style={{ background: '#1f2937', color: '#f9fafb', padding: '12px', borderRadius: '6px', fontSize: '11px', overflow: 'auto', maxHeight: '300px', whiteSpace: 'pre-wrap' }}>
              {this.state.error.stack}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function LoadingFallback({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid var(--mat-sys-primary)',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <p style={{ fontSize: '14px', color: 'var(--mat-sys-on-surface-variant)' }}>{message}</p>
      </div>
    </div>
  )
}

function LazyComponent({ componentName, props }: { componentName: string; props: any }) {
  const Component = ComponentRegistry[componentName as keyof typeof ComponentRegistry] as any

  if (!Component) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', padding: '32px' }}>
        <div style={{
          border: '1px solid var(--mat-sys-error)',
          background: 'color-mix(in srgb, var(--mat-sys-error) 10%, transparent)',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '448px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--mat-sys-error)', marginBottom: '8px' }}>Component Not Found</p>
          <p style={{ fontSize: '14px', color: 'var(--mat-sys-on-surface-variant)' }}>
            <code style={{
              background: 'var(--mat-sys-surface-container)',
              padding: '1px 4px',
              borderRadius: '4px',
              fontSize: '12px',
            }}>{componentName}</code> is not registered in ComponentRegistry.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<LoadingFallback message={`Loading ${componentName.toLowerCase()}...`} />}>
      <Component {...props} />
    </Suspense>
  )
}

function ResizableLayout({
  leftComponent,
  rightComponent,
  leftProps,
  rightProps,
  config,
}: any) {
  const LeftComponent = ComponentRegistry[leftComponent as keyof typeof ComponentRegistry] as any
  const RightComponent = ComponentRegistry[rightComponent as keyof typeof ComponentRegistry] as any

  if (!LeftComponent || !RightComponent) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
        <p style={{ fontSize: '14px', color: 'var(--mat-sys-on-surface-variant)' }}>Layout components not found</p>
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

export function PageWrapper({ pageId }: { pageId: string }) {
  const { stateContext, actionContext } = useAppProject()
  const page = getPageById(pageId)

  if (!page) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
        <p style={{ fontSize: '14px', color: 'var(--mat-sys-on-surface-variant)' }}>Page &quot;{pageId}&quot; not found in pages.json</p>
      </div>
    )
  }

  const props = page.props ? resolveProps(page.props, stateContext, actionContext) : {}

  // JSON page rendering
  if (page.type === 'json' || page.schemaPath) {
    const jsonDataConfig = page.props?.data ?? page.props?.state
    const jsonFunctionsConfig = page.props?.functions ?? page.props?.actions
    const jsonData = jsonDataConfig
      ? resolveProps({ state: jsonDataConfig }, stateContext, actionContext)
      : {}
    const jsonFunctions = jsonFunctionsConfig
      ? resolveProps({ actions: jsonFunctionsConfig }, stateContext, actionContext)
      : {}

    if (page.schema) {
      return <PageRenderer schema={page.schema} data={jsonData} functions={jsonFunctions} />
    }
    if (page.schemaPath) {
      return <JSONSchemaPageLoader schemaPath={page.schemaPath} data={jsonData} functions={jsonFunctions} />
    }
    return <LoadingFallback message={`Schema path missing for JSON page: ${pageId}`} />
  }

  // Resizable layout rendering
  if (page.requiresResizable && page.resizableConfig) {
    const config = page.resizableConfig
    const leftProps = resolveProps(config.leftProps, stateContext, actionContext)

    if (!page.component) {
      return <LoadingFallback message={`Component missing for page: ${pageId}`} />
    }

    return (
      <ResizableLayout
        leftComponent={config.leftComponent}
        rightComponent={page.component}
        leftProps={leftProps}
        rightProps={props}
        config={config}
      />
    )
  }

  // Standard component rendering
  if (!page.component) {
    return <LoadingFallback message={`Component missing for page: ${pageId}`} />
  }

  return (
    <PageErrorBoundary pageId={pageId}>
      <LazyComponent componentName={page.component} props={props} />
    </PageErrorBoundary>
  )
}
