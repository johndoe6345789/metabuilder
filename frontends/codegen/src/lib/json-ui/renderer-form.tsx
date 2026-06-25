import React, { useCallback } from 'react'
import type {
  JSONFormRendererProps,
  UIComponent,
} from './types'
import { JSONUIRenderer } from './renderer'

/**
 * JSONFormRenderer
 *
 * Renders a list of form fields using JSONUIRenderer for each
 * field, delegating change events back via onAction.
 */
export function JSONFormRenderer({
  formData,
  fields,
  onSubmit,
  onChange,
}: JSONFormRendererProps) {
  const handleFieldChange = useCallback(
    (fieldName: string, value: unknown) => {
      onChange?.({ ...formData, [fieldName]: value })
    },
    [formData, onChange]
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      onSubmit(formData)
    },
    [formData, onSubmit]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => {
        const fieldComponent: UIComponent = {
          id: field.id,
          type:
            field.type === 'textarea'
              ? 'Textarea'
              : 'Input',
          props: {
            name: field.name,
            placeholder: field.placeholder,
            required: field.required,
            type: field.type,
            value:
              formData[field.name] ||
              field.defaultValue ||
              '',
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
              <label
                htmlFor={field.name}
                className="text-sm font-medium"
              >
                {field.label}
                {field.required && (
                  <span className="text-destructive ml-1">
                    *
                  </span>
                )}
              </label>
            )}
            <JSONUIRenderer
              component={fieldComponent}
              dataMap={{}}
              onAction={(actions, event) => {
                actions.forEach((action) => {
                  if (
                    action.type === 'set-value' &&
                    action.target === field.name
                  ) {
                    const val = (
                      event as {
                        target?: { value?: unknown }
                      } | undefined
                    )?.target?.value
                    handleFieldChange(field.name, val)
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
