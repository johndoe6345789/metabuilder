'use client'

import type { FieldSchema } from './schema-types'
import { NameTypeFields } from './field-meta/NameTypeFields'
import { LabelDefaultFields } from './field-meta/LabelDefaultFields'
import { RequiredUniqueToggles } from './field-meta/RequiredUniqueToggles'

interface FieldMetaInputsProps {
  field: FieldSchema
  patch: (u: Partial<FieldSchema>) => void
}

export function FieldMetaInputs({ field, patch }: FieldMetaInputsProps) {
  return (
    <>
      <NameTypeFields field={field} patch={patch} />
      <LabelDefaultFields field={field} patch={patch} />
      <RequiredUniqueToggles field={field} patch={patch} />
    </>
  )
}
