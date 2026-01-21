import { ReactNode } from 'react'
import { ComponentSchema } from '@/types/json-ui'
import * as Icons from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface IconRendererProps {
  name: string
  size?: number
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone'
  className?: string
}

export function IconRenderer({ name, size = 24, weight = 'duotone', className }: IconRendererProps) {
  const IconComponent = (Icons as any)[name]
  
  if (!IconComponent) {
    return null
  }
  
  return <IconComponent size={size} weight={weight} className={className} />
}
