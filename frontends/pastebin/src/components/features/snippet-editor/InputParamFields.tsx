import { Input, FormLabel } from '@metabuilder/components/m3'
import { InputParameter } from '@/lib/types'
import styles from './input-parameter-item.module.scss'

interface InputParamFieldsProps {
  param: InputParameter
  index: number
  placeholder: string
  onUpdate: (index: number, field: keyof InputParameter, value: string) => void
}

function ParamLabel({ htmlFor, text }: { htmlFor: string; text: string }) {
  return (
    <FormLabel htmlFor={htmlFor} className={styles.labelXs}>
      {text}
    </FormLabel>
  )
}

export function InputParamFields({
  param,
  index,
  placeholder,
  onUpdate,
}: InputParamFieldsProps) {
  return (
    <>
      <div className={styles.fieldGroup}>
        <ParamLabel htmlFor={`param-default-${index}`} text="Default Value *" />
        <Input
          id={`param-default-${index}`}
          placeholder={placeholder}
          value={param.defaultValue}
          onChange={e => onUpdate(index, 'defaultValue', e.target.value)}
          className={`${styles.inputSmMono} font-mono`}
          data-testid={`param-default-input-${index}`}
          aria-label={`Parameter ${index + 1} default value`}
          required
          aria-required="true"
        />
      </div>

      <div className={styles.fieldGroup}>
        <ParamLabel
          htmlFor={`param-desc-${index}`}
          text="Description (Optional)"
        />
        <Input
          id={`param-desc-${index}`}
          placeholder="What does this parameter do?"
          value={param.description || ''}
          onChange={e => onUpdate(index, 'description', e.target.value)}
          className={styles.inputSm}
          data-testid={`param-description-input-${index}`}
          aria-label={`Parameter ${index + 1} description`}
        />
      </div>
    </>
  )
}
