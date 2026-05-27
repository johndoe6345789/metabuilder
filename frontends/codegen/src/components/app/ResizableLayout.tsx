'use client'

import { Suspense } from 'react'
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable'
import { ComponentRegistry } from '@/lib/component-registry'
import { PageLoadingFallback } from './PageLoadingFallback'

export function ResizableLayout({
  leftComponent,
  rightComponent,
  leftProps,
  rightProps,
  config,
}: any) {
  const LeftComponent =
    ComponentRegistry[
      leftComponent as keyof typeof ComponentRegistry
    ] as any
  const RightComponent =
    ComponentRegistry[
      rightComponent as keyof typeof ComponentRegistry
    ] as any

  if (!LeftComponent || !RightComponent) {
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
          Layout components not found
        </p>
      </div>
    )
  }

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        defaultSize={
          config.leftPanel.defaultSize
        }
        minSize={config.leftPanel.minSize}
        maxSize={config.leftPanel.maxSize}
      >
        <Suspense
          fallback={
            <PageLoadingFallback
              message={`Loading ${leftComponent.toLowerCase()}...`}
            />
          }
        >
          <LeftComponent {...leftProps} />
        </Suspense>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel
        defaultSize={
          config.rightPanel.defaultSize
        }
      >
        <Suspense
          fallback={
            <PageLoadingFallback
              message={`Loading ${rightComponent.toLowerCase()}...`}
            />
          }
        >
          <RightComponent {...rightProps} />
        </Suspense>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
