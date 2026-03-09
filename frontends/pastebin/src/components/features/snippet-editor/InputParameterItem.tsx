import { Button, Card, CardContent, Input, FormLabel, Select, MenuItem, MaterialIcon } from '@metabuilder/components/fakemui'
import type { SelectChangeEvent } from '@metabuilder/components/fakemui'
import { InputParameter } from '@/lib/types'
import styles from './input-parameter-item.module.scss'

interface InputParameterItemProps {
  param: InputParameter
  index: number
  onUpdate: (index: number, field: keyof InputParameter, value: string) => void
  onRemove: (index: number) => void
}

export function InputParameterItem({ param, index, onUpdate, onRemove }: InputParameterItemProps) {
  const getPlaceholder = (type: string) => {
    switch (type) {
      case 'string':
        return '"Hello World"'
      case 'number':
        return '42'
      case 'boolean':
        return 'true'
      case 'array':
        return '["item1", "item2"]'
      case 'object':
        return '{"key": "value"}'
      default:
        return ''
    }
  }

  return (
    <Card className={styles.cardRoot} data-testid={`param-item-${index}`}>
      <CardContent className={styles.cardContent}>
        <div className={styles.topRow}>
          <div className={styles.fieldsGrid}>
            <div className={styles.fieldGroup}>
              <FormLabel htmlFor={`param-name-${index}`} className={styles.labelXs}>
                Name *
              </FormLabel>
              <Input
                id={`param-name-${index}`}
                placeholder="paramName"
                value={param.name}
                onChange={(e) => onUpdate(index, 'name', e.target.value)}
                className={styles.inputSm}
                data-testid={`param-name-input-${index}`}
                aria-label={`Parameter ${index + 1} name`}
                required
                aria-required="true"
              />
            </div>
            <div className={styles.fieldGroup}>
              <FormLabel htmlFor={`param-type-${index}`} className={styles.labelXs}>
                Type
              </FormLabel>
              <Select
                value={param.type}
                onChange={(e: SelectChangeEvent) => onUpdate(index, 'type', e.target.value as string)}
                inputProps={{
                  id: `param-type-${index}`,
                  className: styles.inputSm,
                }}
                data-testid={`param-type-select-${index}`}
                aria-label={`Parameter ${index + 1} type`}
              >
                <MenuItem value="string" data-testid="type-string">string</MenuItem>
                <MenuItem value="number" data-testid="type-number">number</MenuItem>
                <MenuItem value="boolean" data-testid="type-boolean">boolean</MenuItem>
                <MenuItem value="array" data-testid="type-array">array</MenuItem>
                <MenuItem value="object" data-testid="type-object">object</MenuItem>
              </Select>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className={`${styles.removeBtn} h-8 w-8 p-0 text-destructive`}
            data-testid={`remove-parameter-btn-${index}`}
            aria-label={`Remove parameter ${index + 1}`}
          >
            <MaterialIcon name="delete" className={styles.removeIcon} aria-hidden="true" />
          </Button>
        </div>
        <div className={styles.fieldGroup}>
          <FormLabel htmlFor={`param-default-${index}`} className={styles.labelXs}>
            Default Value *
          </FormLabel>
          <Input
            id={`param-default-${index}`}
            placeholder={getPlaceholder(param.type)}
            value={param.defaultValue}
            onChange={(e) => onUpdate(index, 'defaultValue', e.target.value)}
            className={`${styles.inputSmMono} font-mono`}
            data-testid={`param-default-input-${index}`}
            aria-label={`Parameter ${index + 1} default value`}
            required
            aria-required="true"
          />
        </div>
        <div className={styles.fieldGroup}>
          <FormLabel htmlFor={`param-desc-${index}`} className={styles.labelXs}>
            Description (Optional)
          </FormLabel>
          <Input
            id={`param-desc-${index}`}
            placeholder="What does this parameter do?"
            value={param.description || ''}
            onChange={(e) => onUpdate(index, 'description', e.target.value)}
            className={styles.inputSm}
            data-testid={`param-description-input-${index}`}
            aria-label={`Parameter ${index + 1} description`}
          />
        </div>
      </CardContent>
    </Card>
  )
}
