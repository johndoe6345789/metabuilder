import * as Icons from '@phosphor-icons/react'
import { evaluateBindingExpression } from '@/lib/json-ui/expression-helpers'

export function resolveBinding(binding: string, data: Record<string, any>): any {
  return evaluateBindingExpression(binding, data, {
    fallback: binding,
    label: 'json-page-renderer binding',
  })
}

export function getIcon(iconName: string, props?: any) {
  const IconComponent = (Icons as any)[iconName]
  if (!IconComponent) return null
  return <IconComponent size={24} weight="duotone" {...props} />
}
