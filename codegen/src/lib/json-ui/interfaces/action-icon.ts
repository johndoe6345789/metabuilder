export interface ActionIconProps {
  action: 'add' | 'edit' | 'delete' | 'copy' | 'download' | 'upload'
  size?: number
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
  className?: string
}
