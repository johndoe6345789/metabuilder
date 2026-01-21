import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { LANGUAGES } from '@/lib/config'

interface SnippetFormFieldsProps {
  title: string
  description: string
  language: string
  errors: { title?: string; code?: string }
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onLanguageChange: (value: string) => void
}

export function SnippetFormFields({
  title,
  description,
  language,
  errors,
  onTitleChange,
  onDescriptionChange,
  onLanguageChange,
}: SnippetFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="e.g., React Counter Component"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={errors.title ? 'border-destructive ring-destructive' : ''}
          data-testid="snippet-title-input"
          required
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        {errors.title && (
          <p className="text-sm text-destructive" id="title-error">
            {errors.title}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger
            id="language"
            data-testid="snippet-language-select"
            aria-label="Select programming language"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent data-testid="snippet-language-options">
            {LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang} data-testid={`language-option-${lang}`}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="A brief description of your snippet"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={2}
          data-testid="snippet-description-textarea"
          aria-label="Snippet description"
        />
      </div>
    </>
  )
}
