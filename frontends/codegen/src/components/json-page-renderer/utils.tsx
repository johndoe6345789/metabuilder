import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import { evaluateBindingExpression } from '@/lib/json-ui/expression-helpers'

export function resolveBinding(binding: string, data: Record<string, any>): any {
  return evaluateBindingExpression(binding, data, {
    fallback: binding,
    label: 'json-page-renderer binding',
  })
}

const iconCache = new Map<string, ComponentType<any>>()

export function getIcon(iconName: string, props?: any) {
  if (!iconCache.has(iconName)) {
    const LazyIcon = dynamic(
      () => import('@metabuilder/fakemui/icons').then(mod => {
        const Icon = (mod as Record<string, any>)[iconName]
        if (!Icon) return { default: (() => null) as unknown as ComponentType }
        return { default: Icon }
      }),
      { ssr: false }
    )
    iconCache.set(iconName, LazyIcon)
  }
  const IconComponent = iconCache.get(iconName)!
  return <IconComponent size={24} fill={1} weight={500} {...props} />
}
