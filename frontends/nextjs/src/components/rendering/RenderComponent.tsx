import type React from 'react'
import type { ComponentInstance } from '@/lib/types/builder-types'
import type { User } from '@/lib/level-types'
import { RenderNode } from './components/RenderNode'

interface RenderComponentProps {
  component: ComponentInstance
  isSelected: boolean
  onSelect: (id: string) => void
  user?: User
}

export function RenderComponent({ component, isSelected, onSelect, user }: RenderComponentProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect(component.id)
  }

  const renderChildren = () => {
    if (component.children.length === 0) return null
    return component.children.map(child => (
      <RenderComponent
        key={child.id}
        component={child}
        isSelected={isSelected}
        onSelect={onSelect}
        user={user}
      />
    ))
  }

  const wrapperClass = `relative ${isSelected ? 'ring-2 ring-accent ring-offset-2' : 'hover:ring-1 hover:ring-accent/50'} transition-all cursor-pointer`

  return (
    <div className={wrapperClass} onClick={handleClick}>
      <RenderNode component={component} renderChildren={renderChildren} user={user} />
    </div>
  )
}
