'use client'

import { Suspense } from 'react'
import { ComponentRegistry } from '@/lib/component-registry'
import { PageLoadingFallback } from './PageLoadingFallback'

export function LazyComponent({
  componentName,
  props,
}: {
  componentName: string
  props: any
}) {
  const Component =
    ComponentRegistry[
      componentName as keyof typeof ComponentRegistry
    ] as any

  if (!Component) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          padding: '32px',
        }}
      >
        <div
          style={{
            border:
              '1px solid var(--mat-sys-error)',
            background:
              'color-mix(in srgb, var(--mat-sys-error) 10%, transparent)',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '448px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--mat-sys-error)',
              marginBottom: '8px',
            }}
          >
            Component Not Found
          </p>
          <p
            style={{
              fontSize: '14px',
              color:
                'var(--mat-sys-on-surface-variant)',
            }}
          >
            <code
              style={{
                background:
                  'var(--mat-sys-surface-container)',
                padding: '1px 4px',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            >
              {componentName}
            </code>{' '}
            is not registered in
            ComponentRegistry.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Suspense
      fallback={
        <PageLoadingFallback
          message={`Loading ${componentName.toLowerCase()}...`}
        />
      }
    >
      <Component {...props} />
    </Suspense>
  )
}
