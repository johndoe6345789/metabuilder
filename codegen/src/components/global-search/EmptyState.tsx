import { MagnifyingGlass } from '@phosphor-icons/react'
import { CommandEmpty } from '@/components/ui/command'

export function EmptyState() {
  return (
    <CommandEmpty>
      <div className="flex flex-col items-center gap-2 py-6">
        <MagnifyingGlass size={48} weight="duotone" className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No results found</p>
      </div>
    </CommandEmpty>
  )
}
