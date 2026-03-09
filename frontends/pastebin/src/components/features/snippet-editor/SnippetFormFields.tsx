import { FormLabel, Input, Select, MenuItem, Textarea } from '@metabuilder/components/fakemui'
import type { SelectChangeEvent } from '@metabuilder/components/fakemui'
import { LANGUAGES } from '@/lib/config'
import { useTranslation } from '@/hooks/useTranslation'
import styles from './snippet-form-fields.module.scss'

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
  const t = useTranslation()
  return (
    <div className={styles.formRoot} data-testid="snippet-form-fields" role="form" aria-label="Snippet details form">
      <div className={styles.titleRow}>
        <div className={styles.titleField}>
          <FormLabel htmlFor="title">{t.snippetDialog.fields.title.label} *</FormLabel>
          <Input
            id="title"
            type="text"
            placeholder={t.snippetDialog.fields.title.placeholder}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={errors.title ? styles.inputError : ''}
            data-testid="snippet-title-input"
            required
            aria-required="true"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
          {errors.title && (
            <p className={styles.errorText} id="title-error">
              {errors.title}
            </p>
          )}
        </div>

        <div className={styles.languageField}>
          <FormLabel htmlFor="language">{t.snippetDialog.fields.language.label}</FormLabel>
          <Select
            value={language}
            onChange={(e: SelectChangeEvent) => onLanguageChange(e.target.value as string)}
            inputProps={{
              id: 'language',
            }}
            data-testid="snippet-language-select"
            aria-label="Select programming language"
          >
            {LANGUAGES.map((lang) => (
              <MenuItem key={lang} value={lang} data-testid={`language-option-${lang}`}>
                {lang}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>

      <div className={styles.descriptionField}>
        <FormLabel htmlFor="description">{t.snippetDialog.fields.description.label}</FormLabel>
        <Textarea
          id="description"
          placeholder={t.snippetDialog.fields.description.placeholder}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={2}
          className={styles.textarea}
          data-testid="snippet-description-textarea"
          aria-label="Snippet description"
        />
      </div>
    </div>
  )
}
