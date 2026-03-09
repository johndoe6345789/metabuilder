import React, { useCallback } from 'react'
import type {
  Action,
  EventHandler,
  JSONEventDefinition,
  JSONEventMap,
  JSONFormRendererProps,
  JSONUIRendererProps,
  UIComponent,
} from './types'
import { getUIComponent } from './component-registry'
import { resolveDataBinding } from './utils'
import { evaluateConditionExpression } from './expression-helpers'
import { cn } from '@/lib/utils'
import { MAX_LOOP_ITERATIONS } from './constants'
import { useRenderDepth, DepthLimitFallback, trackRender } from './render-depth'

const warnedComponentTypes = new Set<string>()
const warnedLoopIds = new Set<string>()

export function JSONUIRenderer({
  component,
  dataMap = {},
  onAction,
  context = {},
}: JSONUIRendererProps) {
  const { exceeded, DepthProvider } = useRenderDepth()

  // Frame budget: stop all rendering if we've exceeded MAX_RENDERS_PER_FRAME
  if (trackRender()) return null

  if (exceeded) {
    return <DepthLimitFallback componentId={component.id} />
  }

  const renderChildren = (
    children: UIComponent[] | string | undefined,
    renderContext: Record<string, unknown>
  ) => {
    if (!children) return null

    if (typeof children === 'string') {
      return children
    }

    return children.map((child, index) => (
      <React.Fragment key={child.id || `child-${index}`}>
        {renderNode(child, renderContext)}
      </React.Fragment>
    ))
  }

  const renderNode = (
    node: UIComponent | string,
    renderContext: Record<string, unknown>
  ) => {
    if (typeof node === 'string') {
      return node
    }

    return (
      <DepthProvider>
        <JSONUIRenderer
          component={node}
          dataMap={dataMap}
          onAction={onAction}
          context={renderContext}
        />
      </DepthProvider>
    )
  }

  const renderBranch = (
    branch: UIComponent | (UIComponent | string)[] | string | undefined,
    renderContext: Record<string, unknown>
  ) => {
    if (branch === undefined) return null

    if (Array.isArray(branch)) {
      return branch.map((item, index) => (
        <React.Fragment key={typeof item === 'string' ? `text-${index}` : item.id || `branch-${index}`}>
          {renderNode(item, renderContext)}
        </React.Fragment>
      ))
    }

    return renderNode(branch, renderContext)
  }

  const renderConditionalBranch = (
    branch: UIComponent | (UIComponent | string)[] | string | undefined,
    renderContext: Record<string, unknown>
  ) => {
    return renderBranch(branch, renderContext)
  }

  const normalizeEventName = (eventName: string) =>
    eventName.startsWith('on') && eventName.length > 2
      ? `${eventName.charAt(2).toLowerCase()}${eventName.slice(3)}`
      : eventName

  const getEventPropName = (eventName: string) =>
    eventName.startsWith('on')
      ? eventName
      : `on${eventName.charAt(0).toUpperCase()}${eventName.slice(1)}`

  const normalizeEventDefinition = (
    eventName: string,
    definition: JSONEventDefinition | string
  ): EventHandler | null => {
    if (!definition) return null
    const normalizedEvent = normalizeEventName(eventName)

    if (typeof definition === 'string') {
      return {
        event: normalizedEvent,
        actions: [{ id: definition, type: 'custom' }],
      }
    }

    if (definition.actions && Array.isArray(definition.actions)) {
      const actions = definition.payload
        ? definition.actions.map((action) => ({
          ...action,
          params: action.params ?? definition.payload,
        }))
        : definition.actions
      return {
        event: normalizedEvent,
        actions,
        condition: definition.condition,
      }
    }

    if (definition.action) {
      return {
        event: normalizedEvent,
        actions: [{ id: definition.action, type: 'custom', params: definition.payload }],
        condition: definition.condition,
      }
    }

    return null
  }

  const applyEventHandlers = (
    props: Record<string, any>,
    renderContext: Record<string, unknown>
  ) => {
    const eventHandlers: EventHandler[] = Array.isArray(component.events)
      ? component.events.map((handler) => ({
        ...handler,
        event: normalizeEventName(handler.event),
      }))
      : component.events
        ? Object.entries(component.events as JSONEventMap).flatMap(([eventName, handler]) => {
          if (Array.isArray(handler)) {
            return handler
              .map((entry) => normalizeEventDefinition(eventName, entry))
              .filter(Boolean) as EventHandler[]
          }
          const normalized = normalizeEventDefinition(eventName, handler)
          return normalized ? [normalized] : []
        })
        : []

    if (eventHandlers.length > 0) {
      eventHandlers.forEach((handler) => {
        const propName = getEventPropName(handler.event)
        props[propName] = (event?: any) => {
          if (handler.condition) {
            const conditionMet = evaluateConditionExpression(handler.condition, { ...dataMap, ...renderContext }, { label: 'event handler condition' })
            if (!conditionMet) return
          }
          const eventPayload = typeof event === 'object' && event !== null
            ? { ...event, ...renderContext }
            : event
          onAction?.(handler.actions, eventPayload)
        }
      })
    }
  }

  const resolveProps = (renderContext: Record<string, unknown>) => {
    const props: Record<string, any> = { ...component.props }

    if (component.bindings) {
      Object.entries(component.bindings as Record<string, any>).forEach(([propName, binding]) => {
        props[propName] = resolveDataBinding(binding, dataMap, renderContext)
      })
    }

    if (component.dataBinding) {
      const boundData = resolveDataBinding(component.dataBinding, dataMap, renderContext)
      if (boundData !== undefined) {
        props.value = boundData
        props.data = boundData
      }
    }

    if (component.className) {
      props.className = cn(props.className, component.className)
    }

    if (component.style) {
      props.style = { ...props.style, ...component.style }
    }

    return props
  }

  const renderWithContext = (renderContext: Record<string, unknown>) => {
    // Simple visibility gate — two forms:
    //   Object binding: { "source": "hookData.open" } → resolveDataBinding
    //   String expression: "isScanning", "item.id === selectedId" → evaluateConditionExpression
    if (component.condition) {
      const visible = typeof component.condition === 'string'
        ? evaluateConditionExpression(component.condition, { ...dataMap, ...renderContext }, { label: `condition (${component.id})` })
        : resolveDataBinding(component.condition, dataMap, renderContext)
      if (!visible) return null
    }

    if (component.conditional) {
      const conditionMet = evaluateConditionExpression(component.conditional.if, { ...dataMap, ...renderContext }, { label: `component conditional (${component.id})` })
      if (conditionMet) {
        if (component.conditional.then !== undefined) {
          return renderConditionalBranch(
            component.conditional.then as UIComponent | (UIComponent | string)[] | string,
            renderContext
          )
        }
      } else {
        if (component.conditional.else !== undefined) {
          return renderConditionalBranch(
            component.conditional.else as UIComponent | (UIComponent | string)[] | string,
            renderContext
          )
        }
        return null
      }
    }

    const Component = getUIComponent(component.type)

    if (!Component) {
      if (!warnedComponentTypes.has(component.type)) {
        warnedComponentTypes.add(component.type)
        console.warn(`[JSON-UI] Component type "${component.type}" not found in registry (id: ${component.id})`)
      }
      if (process.env.NODE_ENV !== 'production') {
        return <div style={{ border: '1px dashed #ef4444', padding: '4px 8px', margin: '2px', borderRadius: '4px', fontSize: '12px', color: '#ef4444' }}>Missing: {component.type} ({component.id})</div>
      }
      return null
    }

    const props = resolveProps(renderContext)
    applyEventHandlers(props, renderContext)

    // Handle list/itemTemplate pattern: iterate over resolved items array
    // and render the itemTemplate for each item, injecting { item, index } into context
    if (component.itemTemplate) {
      // Always strip list-specific props from DOM regardless of whether items resolved
      const items = props.items
      const keyPath = typeof props.keyPath === 'string' ? props.keyPath : undefined
      delete props.items
      delete props.keyPath

      if (!Array.isArray(items)) {
        // items not yet available — render container with no children
        if (typeof Component === 'string') {
          const domProps = { ...props }
          for (const key of Object.keys(domProps)) {
            if (/^on[A-Z]/.test(key) && typeof domProps[key] !== 'function') delete domProps[key]
            if (key === '_if') delete domProps[key]
          }
          if (domProps.style && typeof domProps.style !== 'object') delete domProps.style
          return React.createElement(Component, domProps)
        }
        return <Component {...props} />
      }

      const itemChildren = items.map((itemData: any, index: number) => {
        const itemContext = { ...renderContext, item: itemData, index }
        const key = keyPath && itemData ? itemData[keyPath] : `${component.id}-item-${index}`
        return (
          <DepthProvider key={key}>
            <JSONUIRenderer
              component={component.itemTemplate!}
              dataMap={dataMap}
              onAction={onAction}
              context={itemContext}
            />
          </DepthProvider>
        )
      })

      if (typeof Component === 'string') {
        const domProps = { ...props }
        for (const key of Object.keys(domProps)) {
          if (/^on[A-Z]/.test(key) && typeof domProps[key] !== 'function') delete domProps[key]
          if (key === '_if') delete domProps[key]
        }
        if (domProps.style && typeof domProps.style !== 'object') delete domProps.style
        return React.createElement(Component, domProps, itemChildren)
      }

      return <Component {...props}>{itemChildren}</Component>
    }

    // Only pass rendered children when the schema defines them.
    // When component.children is undefined/empty, let React use props.children
    // (e.g. <h2 children="Data Models" />) instead of overriding with null.
    const renderedChildren = renderChildren(component.children, renderContext)

    if (typeof Component === 'string') {
      // Sanitize props for native DOM elements
      const domProps = { ...props }
      for (const key of Object.keys(domProps)) {
        // Strip non-function event handler props
        if (/^on[A-Z]/.test(key) && typeof domProps[key] !== 'function') {
          delete domProps[key]
        }
        // Strip _if pseudo-binding (not a real DOM attribute)
        if (key === '_if') {
          delete domProps[key]
        }
      }
      // React requires style to be an object, not a string
      if (domProps.style && typeof domProps.style !== 'object') {
        delete domProps.style
      }
      // Controlled value without onChange → use defaultValue instead
      if ('value' in domProps && typeof domProps.onChange !== 'function') {
        domProps.defaultValue = domProps.value
        delete domProps.value
      }
      if (renderedChildren !== null) {
        return React.createElement(Component, domProps, renderedChildren)
      }
      return React.createElement(Component, domProps)
    }

    if (renderedChildren !== null) {
      return (
        <Component {...props}>
          {renderedChildren}
        </Component>
      )
    }
    return <Component {...props} />
  }

  if (component.loop) {
    // Check condition gate before entering loop (mirrors renderWithContext)
    if (component.condition) {
      const visible = typeof component.condition === 'string'
        ? evaluateConditionExpression(component.condition, { ...dataMap, ...context }, { label: `loop condition (${component.id})` })
        : resolveDataBinding(component.condition, dataMap, context)
      if (!visible) return null
    }

    const rawItems = resolveDataBinding(component.loop.source, dataMap, context) || []
    if (rawItems.length > MAX_LOOP_ITERATIONS && !warnedLoopIds.has(component.id)) {
      warnedLoopIds.add(component.id)
      console.warn(`Loop "${component.id}" has ${rawItems.length} items, capped to ${MAX_LOOP_ITERATIONS}`)
    }
    const items = rawItems.length > MAX_LOOP_ITERATIONS ? rawItems.slice(0, MAX_LOOP_ITERATIONS) : rawItems
    const Component = getUIComponent(component.type)

    if (!Component) {
      if (!warnedComponentTypes.has(component.type)) {
        warnedComponentTypes.add(component.type)
        console.warn(`[JSON-UI] Component type "${component.type}" not found in registry (id: ${component.id})`)
      }
      if (process.env.NODE_ENV !== 'production') {
        return <div style={{ border: '1px dashed #ef4444', padding: '4px 8px', margin: '2px', borderRadius: '4px', fontSize: '12px', color: '#ef4444' }}>Missing: {component.type} ({component.id})</div>
      }
      return null
    }

    const containerProps = resolveProps(context)
    applyEventHandlers(containerProps, context)

    const loopChildren = items.map((item: any, index: number) => {
      const loopContext = {
        ...context,
        [component.loop!.itemVar]: item,
        ...(component.loop!.indexVar ? { [component.loop!.indexVar]: index } : {}),
      }

      let content: React.ReactNode = renderChildren(component.children, loopContext)

      if (component.conditional) {
        const conditionMet = evaluateConditionExpression(component.conditional.if, { ...dataMap, ...loopContext }, { label: `loop conditional (${component.id})` })
        if (conditionMet) {
          if (component.conditional.then !== undefined) {
            content = renderConditionalBranch(
              component.conditional.then as UIComponent | (UIComponent | string)[] | string,
              loopContext
            )
          }
        } else {
          if (component.conditional.else !== undefined) {
            content = renderConditionalBranch(
              component.conditional.else as UIComponent | (UIComponent | string)[] | string,
              loopContext
            )
          } else {
            content = null
          }
        }
      }

      return (
        <React.Fragment key={`${component.id}-${index}`}>
          {content}
        </React.Fragment>
      )
    })

    if (typeof Component === 'string') {
      return React.createElement(Component, containerProps, loopChildren)
    }

    return (
      <Component {...containerProps}>
        {loopChildren}
      </Component>
    )
  }

  return renderWithContext(context)
}

export function JSONFormRenderer({ formData, fields, onSubmit, onChange }: JSONFormRendererProps) {
  const handleFieldChange = useCallback((fieldName: string, value: unknown) => {
    const newData = { ...formData, [fieldName]: value }
    onChange?.(newData)
  }, [formData, onChange])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }, [formData, onSubmit])

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => {
        const fieldComponent: UIComponent = {
          id: field.id,
          type: field.type === 'textarea' ? 'Textarea' : 'Input',
          props: {
            name: field.name,
            placeholder: field.placeholder,
            required: field.required,
            type: field.type,
            value: formData[field.name] || field.defaultValue || '',
          },
          events: [
            {
              event: 'change',
              actions: [
                {
                  id: `field-change-${field.name}`,
                  type: 'set-value',
                  target: field.name,
                },
              ],
            },
          ],
        }

        return (
          <div key={field.id} className="space-y-2">
            {field.label && (
              <label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </label>
            )}
            <JSONUIRenderer
              component={fieldComponent}
              dataMap={{}}
              onAction={(actions, event) => {
                actions.forEach((action) => {
                  if (action.type === 'set-value' && action.target === field.name) {
                    const targetValue = (event as { target?: { value?: unknown } } | undefined)?.target?.value
                    handleFieldChange(field.name, targetValue)
                  }
                })
              }}
            />
          </div>
        )
      })}
    </form>
  )
}
