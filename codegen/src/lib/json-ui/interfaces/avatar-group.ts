export interface AvatarGroupProps {
  avatars: {
    src?: string
    alt: string
    fallback: string
  }[]
  max?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
}
