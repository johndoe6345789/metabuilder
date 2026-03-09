import { PropertyEditorField } from '@/components/atoms'
import { Stack, Text } from '@/components/atoms'
import { PropertyEditorFieldDefinition } from '@/components/molecules/property-editor/propertyEditorConfig'
import { UIComponent } from '@/types/json-ui'

interface PropertyEditorSectionProps {
  title: string
  fields: PropertyEditorFieldDefinition[]
  component: UIComponent
  onChange: (key: string, value: unknown) => void
}

export function PropertyEditorSection({ title, fields, component, onChange }: PropertyEditorSectionProps) {
  return (
    <Stack spacing="md">
      <Text variant="caption" className="font-semibold uppercase tracking-wide">
        {title}
      </Text>
      {fields.map((field) => (
        <PropertyEditorField
          key={field.name}
          label={field.label}
          name={field.name}
          value={component.props?.[field.name]}
          type={field.type}
          options={field.options}
          onChange={onChange}
        />
      ))}
    </Stack>
  )
}
