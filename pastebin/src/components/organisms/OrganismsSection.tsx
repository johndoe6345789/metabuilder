import { Snippet } from '@/lib/types'
import { NavigationBarsShowcase } from './showcases/NavigationBarsShowcase'
import { DataTablesShowcase } from './showcases/DataTablesShowcase'
import { FormsShowcase } from './showcases/FormsShowcase'
import { TaskListsShowcase } from './showcases/TaskListsShowcase'
import { ContentGridsShowcase } from './showcases/ContentGridsShowcase'
import { SidebarNavigationShowcase } from './showcases/SidebarNavigationShowcase'

interface OrganismsSectionProps {
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function OrganismsSection({ onSaveSnippet }: OrganismsSectionProps) {
  return (
    <div className="space-y-16" data-testid="organisms-section" role="region" aria-label="Organism design system components">
      <NavigationBarsShowcase onSaveSnippet={onSaveSnippet} />
      <DataTablesShowcase />
      <FormsShowcase />
      <TaskListsShowcase />
      <ContentGridsShowcase />
      <SidebarNavigationShowcase />
    </div>
  )
}
