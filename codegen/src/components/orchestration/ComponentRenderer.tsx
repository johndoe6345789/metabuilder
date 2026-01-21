import { ReactNode } from 'react'
import { ComponentSchema as ComponentSchemaType } from '@/types/page-schema'
import { getUIComponent } from '@/lib/json-ui/component-registry'
import { evaluateConditionExpression, evaluateTransformExpression } from '@/lib/json-ui/expression-helpers'

interface ComponentRendererProps {
  schema: ComponentSchemaType
  context: Record<string, any>
  onEvent?: (event: string, params?: any) => void
}

export function ComponentRenderer({ schema, context, onEvent }: ComponentRendererProps) {
  const Component = getUIComponent(schema.type)
  
  if (!Component) {
    console.warn(`Component type "${schema.type}" not found`)
    return null
  }
  
  if (schema.condition) {
    const conditionMet = evaluateConditionExpression(schema.condition, context, {
      label: `component condition (${schema.id})`,
    })
    if (!conditionMet) {
      return null
    }
  }
  
  const props = { ...schema.props }
  
  if (schema.bindings) {
    schema.bindings.forEach(binding => {
      const value = getNestedValue(context, binding.source)
      if (binding.transform) {
        props[binding.target] = evaluateTransformExpression(binding.transform, value, context, {
          fallback: value,
          label: `binding transform (${binding.target})`,
        })
      } else {
        props[binding.target] = value
      }
    })
  }
  
  if (schema.events) {
    schema.events.forEach(event => {
      props[event.event] = () => {
        if (onEvent) {
          onEvent(event.action, event.params)
        }
      }
    })
  }
  
  const children: ReactNode[] = []
  
  if (schema.children) {
    schema.children.forEach((child, index) => {
      children.push(
        <ComponentRenderer
          key={child.id || index}
          schema={child}
          context={context}
          onEvent={onEvent}
        />
      )
    })
  }
  
  if (typeof Component === 'string') {
    return <Component {...props}>{children}</Component>
  }
  
  return <Component {...props}>{children.length > 0 ? children : undefined}</Component>
}

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}
