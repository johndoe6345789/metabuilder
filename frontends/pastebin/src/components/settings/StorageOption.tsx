import {
  Radio, FormLabel, FormControlLabel,
} from '@metabuilder/components/fakemui'
import type { StorageBackend } from '@/lib/storage'
import styles from './settings-card.module.scss'

interface StorageOptionProps {
  id: string
  value: StorageBackend
  checked: boolean
  disabled: boolean
  label: string
  desc: string
  labelClass: string
}

export function StorageOption({
  id,
  value,
  checked,
  disabled,
  label,
  desc,
  labelClass,
}: StorageOptionProps) {
  return (
    <FormControlLabel
      value={value}
      control={
        <Radio
          id={id}
          value={value}
          checked={checked}
          onChange={() => {}}
          disabled={disabled}
        />
      }
      label={
        <div className={styles.radioOptionContent}>
          <FormLabel htmlFor={id} className={labelClass}>
            {label}
          </FormLabel>
          <p className={styles.radioOptionDesc}>{desc}</p>
        </div>
      }
    />
  )
}
