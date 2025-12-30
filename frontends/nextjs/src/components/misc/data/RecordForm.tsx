import { FloppyDisk, X } from '@/fakemui/icons'
import { useEffect, useState } from 'react'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { ScrollArea } from '@/components/ui'
import type { ModelSchema, SchemaConfig } from '@/lib/schema-types'
import { createEmptyRecord, validateRecord } from '@/lib/schema-utils'

import { FieldRenderer } from './FieldRenderer'

interface RecordFormProps {
  open: boolean
  onClose: () => void
  model: ModelSchema
  schema: SchemaConfig
  currentApp: string
  record?: Record<string, unknown>
  onSave: (record: Record<string, unknown>) => void
}

export function RecordForm({
  open,
  onClose,
  model,
  schema,
  currentApp,
  record,
  onSave,
}: RecordFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(record || createEmptyRecord(model))
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (record) {
      setFormData(record)
    } else {
      setFormData(createEmptyRecord(model))
    }
    setErrors({})
  }, [record, model, open])

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[fieldName]
        return newErrors
      })
    }
  }

  const handleSave = () => {
    const validationErrors = validateRecord(model, formData)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onSave(formData)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {record ? 'Edit' : 'Create'} {model.label || model.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {model.fields.map(field => (
              <FieldRenderer
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={value => handleFieldChange(field.name, value)}
                error={errors[field.name]}
                schema={schema}
                currentApp={currentApp}
              />
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <FloppyDisk className="mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
