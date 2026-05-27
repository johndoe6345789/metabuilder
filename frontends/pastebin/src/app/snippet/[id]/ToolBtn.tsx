import { MaterialIcon } from '@metabuilder/components/fakemui'
import styles from './snippet-view-page.module.scss'

interface ToolBtnProps {
  active?: boolean
  disabled?: boolean
  title: string
  label: string
  icon: string
  extra?: string
  testId?: string
  onClick: () => void
}

export function ToolBtn({
  active,
  disabled,
  title,
  label,
  icon,
  extra,
  testId,
  onClick,
}: ToolBtnProps) {
  const cls = [
    styles.toolBtn,
    active ? styles.toolBtnActive : '',
    extra ?? '',
  ].filter(Boolean).join(' ')
  return (
    <button
      className={cls}
      onClick={onClick}
      title={title}
      aria-label={label}
      disabled={disabled}
      aria-pressed={active !== undefined ? active : undefined}
      data-testid={testId}
    >
      <MaterialIcon name={icon} size={14} />
      <span>{title}</span>
    </button>
  )
}
