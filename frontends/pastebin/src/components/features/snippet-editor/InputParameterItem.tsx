import {
  Button,
  Card,
  CardContent,
  Input,
  FormLabel,
  Select,
  MenuItem,
  MaterialIcon,
} from '@metabuilder/components/fakemui'
import type { SelectChangeEvent } from '@metabuilder/components/fakemui'
import { InputParameter } from '@/lib/types'
import placeholders from '@/data/paramTypePlaceholders.json'
import { InputParamFields } from './InputParamFields'
import styles from './input-parameter-item.module.scss'

interface InputParameterItemProps {
  param: InputParameter
  index: number
  onUpdate: (index: number, field: keyof InputParameter, value: string) => void
  onRemove: (index: number) => void
}

const TYPE_OPTIONS = ['string', 'number', 'boolean', 'array', 'object']

function ParamLabel({ htmlFor, text }: { htmlFor: string; text: string }) {
  return (
    <FormLabel htmlFor={htmlFor} className={styles.labelXs}>
      {text}
    </FormLabel>
  )
}

export function InputParameterItem({
  param,
  index,
  onUpdate,
  onRemove,
}: InputParameterItemProps) {
  const placeholder = (placeholders as Record<string, string>)[param.type] ?? ''

  return (
    <Card className={styles.cardRoot} data-testid={`param-item-${index}`}>
      <CardContent className={styles.cardContent}>
        <div className={styles.topRow}>
          <div className={styles.fieldsGrid}>
            <div className={styles.fieldGroup}>
              <ParamLabel htmlFor={`param-name-${index}`} text="Name *" />
              <Input
                id={`param-name-${index}`}
                placeholder="paramName"
                value={param.name}
                onChange={e => onUpdate(index, 'name', e.target.value)}
                className={styles.inputSm}
                data-testid={`param-name-input-${index}`}
                aria-label={`Parameter ${index + 1} name`}
                required
                aria-required="true"
              />
            </div>
            <div className={styles.fieldGroup}>
              <ParamLabel htmlFor={`param-type-${index}`} text="Type" />
              <Select
                value={param.type}
                onChange={(e: SelectChangeEvent) =>
                  onUpdate(index, 'type', e.target.value as string)
                }
                inputProps={{
                  id: `param-type-${index}`,
                  className: styles.inputSm,
                }}
                data-testid={`param-type-select-${index}`}
                aria-label={`Parameter ${index + 1} type`}
              >
                {TYPE_OPTIONS.map(t => (
                  <MenuItem key={t} value={t} data-testid={`type-${t}`}>
                    {t}
                  </MenuItem>
                ))}
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
            <MaterialIcon
              name="delete"
              className={styles.removeIcon}
              aria-hidden="true"
            />
          </Button>
        </div>

        <InputParamFields
          param={param}
          index={index}
          placeholder={placeholder}
          onUpdate={onUpdate}
        />
      </CardContent>
    </Card>
  )
}
