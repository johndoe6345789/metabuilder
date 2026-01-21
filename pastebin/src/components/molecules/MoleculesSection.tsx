import { Snippet } from '@/lib/types'
import { FormFieldsSection } from './FormFieldsSection'
import { SearchBarsSection } from './SearchBarsSection'
import { UserCardsSection } from './UserCardsSection'
import { SocialActionsSection } from './SocialActionsSection'
import { StatusIndicatorsSection } from './StatusIndicatorsSection'
import { ContentPreviewCardsSection } from './ContentPreviewCardsSection'

interface MoleculesSectionProps {
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function MoleculesSection({ onSaveSnippet }: MoleculesSectionProps) {
  return (
    <div className="space-y-16" data-testid="molecules-section" role="region" aria-label="Molecular design system components">
      <FormFieldsSection onSaveSnippet={onSaveSnippet} />
      <SearchBarsSection onSaveSnippet={onSaveSnippet} />
      <UserCardsSection />
      <SocialActionsSection />
      <StatusIndicatorsSection />
      <ContentPreviewCardsSection />
    </div>
  )
}
