'use client'

import {
  getPageById,
  resolveProps,
} from '@/config/page-loader'
import { JSONSchemaPageLoader } from '@/components/JSONSchemaPageLoader'
import { PageRenderer } from '@/lib/json-ui/page-renderer'
import useAppProject from '@/hooks/use-app-project'
import { PageErrorBoundary } from './PageErrorBoundary'
import { PageLoadingFallback } from './PageLoadingFallback'
import { ResizableLayout } from './ResizableLayout'
import { LazyComponent } from './LazyComponent'

export function PageWrapper({
  pageId,
}: {
  pageId: string
}) {
  const { stateContext, actionContext } =
    useAppProject()
  const page = getPageById(pageId)

  if (!page) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
        }}
      >
        <p
          style={{
            fontSize: '14px',
            color:
              'var(--mat-sys-on-surface-variant)',
          }}
        >
          Page &quot;{pageId}&quot; not found in
          pages.json
        </p>
      </div>
    )
  }

  const props = page.props
    ? resolveProps(
        page.props,
        stateContext,
        actionContext
      )
    : {}

  if (page.type === 'json' || page.schemaPath) {
    const jsonDataCfg =
      page.props?.data ?? page.props?.state
    const jsonFnCfg =
      page.props?.functions ?? page.props?.actions
    const jsonData = jsonDataCfg
      ? resolveProps(
          { state: jsonDataCfg },
          stateContext,
          actionContext
        )
      : {}
    const jsonFunctions = jsonFnCfg
      ? resolveProps(
          { actions: jsonFnCfg },
          stateContext,
          actionContext
        )
      : {}

    if (page.schema) {
      return (
        <PageRenderer
          schema={page.schema}
          data={jsonData}
          functions={jsonFunctions}
        />
      )
    }
    if (page.schemaPath) {
      return (
        <JSONSchemaPageLoader
          schemaPath={page.schemaPath}
          data={jsonData}
          functions={jsonFunctions}
        />
      )
    }
    return (
      <PageLoadingFallback
        message={`Schema path missing for JSON page: ${pageId}`}
      />
    )
  }

  if (
    page.requiresResizable &&
    page.resizableConfig
  ) {
    const config = page.resizableConfig
    const leftProps = resolveProps(
      config.leftProps,
      stateContext,
      actionContext
    )
    if (!page.component) {
      return (
        <PageLoadingFallback
          message={`Component missing for page: ${pageId}`}
        />
      )
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

  if (!page.component) {
    return (
      <PageLoadingFallback
        message={`Component missing for page: ${pageId}`}
      />
    )
  }

  return (
    <PageErrorBoundary pageId={pageId}>
      <LazyComponent
        componentName={page.component}
        props={props}
      />
    </PageErrorBoundary>
  )
}
