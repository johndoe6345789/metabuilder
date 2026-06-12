import { Input, MaterialIcon } from '@metabuilder/components/fakemui'
import styles from './FileTree.module.scss'

interface FileTreeAddRowProps {
  newFileName: string
  placeholder: string
  label: string
  onChange: (v: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onConfirm: () => void
  onCancel: () => void
}

export function FileTreeAddRow({
  newFileName,
  placeholder,
  label,
  onChange,
  onKeyDown,
  onConfirm,
  onCancel,
}: FileTreeAddRowProps) {
  return (
    <li className={styles.addingRow} data-testid="file-tree-adding-row">
      <Input
        value={newFileName}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus
        className={styles.addInput}
        aria-label={label}
        data-testid="file-tree-new-name-input"
      />
      <button
        className={styles.iconBtn}
        onClick={onConfirm}
        aria-label="Confirm add"
      >
        <MaterialIcon name="check" size={12} />
      </button>
      <button
        className={styles.iconBtn}
        onClick={onCancel}
        aria-label="Cancel add"
      >
        <MaterialIcon name="close" size={12} />
      </button>
    </li>
  )
}
