import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ModelSchema, SchemaConfig } from '@/lib/schema-types'
import { validateRecord, createEmptyRecord } from '@/lib/schema-utils'
import { FieldRenderer } from './FieldRenderer'
import { FloppyDisk, X } from '@phosphor-icons/react'

interface RecordFormProps {
  open: boolean
  onClose: () => void
  model: ModelSchema
  schema: SchemaConfig
  currentApp: string
  record?: any
  onSave: (record: any) => void
}

export function RecordForm({ open, onClose, model, schema, currentApp, record, onSave }: RecordFormProps) {
  const [formData, setFormData] = useState<any>(record || createEmptyRecord(model))
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (record) {
      setFormData(record)
    } else {
      setFormData(createEmptyRecord(model))
    }
    setErrors({})
  }, [record, model, open])

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value,
    }))
    if (errors[fieldName]) {
      setErrors((prev) => {
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
            {model.fields.map((field) => (
              <FieldRenderer
                key={field.name}
                field={field}
                value={formData[field.name]}
                onChange={(value) => handleFieldChange(field.name, value)}
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
          <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <FloppyDisk className="mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
