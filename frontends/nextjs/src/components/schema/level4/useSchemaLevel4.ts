import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import type { FieldSchema, ModelSchema } from '@/lib/schema-types'

interface UseSchemaLevel4Props {
  schemas: ModelSchema[]
  onSchemasChange: (schemas: ModelSchema[]) => void
}

export function useSchemaLevel4({ schemas, onSchemasChange }: UseSchemaLevel4Props) {
  const [selectedModel, setSelectedModel] = useState<string | null>(schemas[0]?.name ?? null)

  useEffect(() => {
    if (!selectedModel && schemas[0]) {
      setSelectedModel(schemas[0].name)
    }

    if (selectedModel && !schemas.some(schema => schema.name === selectedModel)) {
      setSelectedModel(schemas[0]?.name ?? null)
    }
  }, [schemas, selectedModel])

  const currentModel = useMemo(
    () => schemas.find((schema) => schema.name === selectedModel) ?? null,
    [schemas, selectedModel]
  )

  const applyChanges = useCallback(
    (nextSchemas: ModelSchema[]) => {
      onSchemasChange(nextSchemas)
    },
    [onSchemasChange]
  )

  const handleAddModel = useCallback(() => {
    const newModel: ModelSchema = {
      name: `Model_${Date.now()}`,
      label: 'New Model',
      fields: [],
    }

    applyChanges([...schemas, newModel])
    setSelectedModel(newModel.name)
    toast.success('Model created')
  }, [applyChanges, schemas])

  const handleDeleteModel = useCallback(
    (modelName: string) => {
      const updatedSchemas = schemas.filter((schema) => schema.name !== modelName)

      applyChanges(updatedSchemas)
      if (selectedModel === modelName) {
        setSelectedModel(updatedSchemas[0]?.name ?? null)
      }
      toast.success('Model deleted')
    },
    [applyChanges, schemas, selectedModel]
  )

  const handleUpdateModel = useCallback(
    (updates: Partial<ModelSchema>) => {
      if (!currentModel) return

      applyChanges(
        schemas.map((schema) =>
          schema.name === currentModel.name ? { ...schema, ...updates } : schema
        )
      )
    },
    [applyChanges, currentModel, schemas]
  )

  const handleAddField = useCallback(() => {
    if (!currentModel) return

    const newField: FieldSchema = {
      name: `field_${Date.now()}`,
      type: 'string',
      label: 'New Field',
      required: false,
      editable: true,
    }

    handleUpdateModel({
      fields: [...currentModel.fields, newField],
    })
    toast.success('Field added')
  }, [currentModel, handleUpdateModel])

  const handleDeleteField = useCallback(
    (fieldName: string) => {
      if (!currentModel) return

      handleUpdateModel({
        fields: currentModel.fields.filter((field) => field.name !== fieldName),
      })
      toast.success('Field deleted')
    },
    [currentModel, handleUpdateModel]
  )

  const handleUpdateField = useCallback(
    (fieldName: string, updates: Partial<FieldSchema>) => {
      if (!currentModel) return

      handleUpdateModel({
        fields: currentModel.fields.map((field) =>
          field.name === fieldName ? { ...field, ...updates } : field
        ),
      })
    },
    [currentModel, handleUpdateModel]
  )

  return {
    currentModel,
    selectedModel,
    selectModel: setSelectedModel,
    handleAddField,
    handleAddModel,
    handleDeleteField,
    handleDeleteModel,
    handleUpdateField,
    handleUpdateModel,
  }
}
