import { Snippet } from '@/lib/types'
import { ButtonsSection } from './ButtonsSection'
import { BadgesSection } from './BadgesSection'
import { InputsSection } from './InputsSection'
import { TypographySection } from './TypographySection'
import { IconsSection } from './IconsSection'
import { ColorsSection } from './ColorsSection'

interface AtomsSectionProps {
  onSaveSnippet: (snippet: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function AtomsSection({ onSaveSnippet }: AtomsSectionProps) {
  return (
    <div className="space-y-16" data-testid="atoms-section" role="region" aria-label="Atomic design system components">
      <ButtonsSection onSaveSnippet={onSaveSnippet} />
      <BadgesSection onSaveSnippet={onSaveSnippet} />
      <InputsSection onSaveSnippet={onSaveSnippet} />
      <TypographySection />
      <IconsSection />
      <ColorsSection />
    </div>
  )
}
