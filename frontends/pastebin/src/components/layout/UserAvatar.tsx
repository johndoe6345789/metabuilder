import styles from './UserAvatar.module.scss'

const PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#84cc16', '#14b8a6', '#3b82f6',
]

function avatarColor(username: string): string {
  const hash = username.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return PALETTE[hash % PALETTE.length]
}

function initials(username: string): string {
  return username.slice(0, 2).toUpperCase()
}

interface UserAvatarProps {
  username: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function UserAvatar({ username, size = 'md', className }: UserAvatarProps) {
  const bg = avatarColor(username)
  return (
    <div
      className={`${styles.avatar} ${styles[size]} ${className ?? ''}`}
      style={{ backgroundColor: bg }}
      aria-label={`${username} avatar`}
    >
      {initials(username)}
    </div>
  )
}
