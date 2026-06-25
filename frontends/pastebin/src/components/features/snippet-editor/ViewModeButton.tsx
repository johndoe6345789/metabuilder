import { Button, MaterialIcon } from '@metabuilder/components/m3'
import type { ViewMode } from './hooks/useSplitScreenEditor'
import styles from './split-screen-editor.module.scss'

interface ViewModeButtonProps {
  mode: ViewMode
  active: boolean
  label: string
  iconName: string
  onClick: () => void
}

export function ViewModeButton({
  mode,
  active,
  label,
  iconName,
  onClick,
}: ViewModeButtonProps) {
  return (
    <Button
      variant={active ? 'filled' : 'text'}
      size="sm"
      onClick={onClick}
      className={styles.viewModeBtn}
      data-testid={`view-mode-${mode}-btn`}
      aria-label={label}
      aria-pressed={active}
    >
      <MaterialIcon
        name={iconName}
        className={styles.iconSm}
        aria-hidden="true"
      />
      <span className={styles.btnLabel}>{label}</span>
    </Button>
  )
}
