import { MaterialIcon } from '@metabuilder/components/m3'
import styles from './login.module.scss'

interface PasswordFieldProps {
  id: string
  value: string
  showPass: boolean
  testId: string
  toggleTestId: string
  autoComplete: string
  onChange: (v: string) => void
  onToggle: () => void
}

export function PasswordField({
  id,
  value,
  showPass,
  testId,
  toggleTestId,
  autoComplete,
  onChange,
  onToggle,
}: PasswordFieldProps) {
  return (
    <div className={styles.inputRow}>
      <input
        id={id}
        className={`${styles.input} ${styles.withIcon}`}
        type={showPass ? 'text' : 'password'}
        data-testid={testId}
        aria-required="true"
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className={styles.eyeBtn}
        aria-label={showPass ? 'Hide password' : 'Show password'}
        data-testid={toggleTestId}
        onClick={onToggle}
      >
        <MaterialIcon name={showPass ? 'visibility_off' : 'visibility'} />
      </button>
    </div>
  )
}
