'use client'

import { useEffect } from 'react'
import { Menu, MenuItem, Divider, MaterialIcon } from '@metabuilder/components/fakemui'
import { SnippetTemplate } from '@/lib/types'
import { useTranslation } from '@/hooks/useTranslation'
import styles from './template-picker.module.scss'

export interface TemplateSection {
  label: string
  templates: SnippetTemplate[]
}

export interface TemplatePickerProps {
  anchor: HTMLElement | null
  onClose: () => void
  onCreateNew: () => void
  onCreateFromTemplate: (id: string) => void
  sections: TemplateSection[]
  'data-testid'?: string
}

export function TemplatePicker({
  anchor,
  onClose,
  onCreateNew,
  onCreateFromTemplate,
  sections,
  'data-testid': testId,
}: TemplatePickerProps) {
  const t = useTranslation()
  // Menu position is calculated once at open-time; close on resize so it re-anchors correctly
  useEffect(() => {
    if (!anchor) return
    const handleResize = () => onClose()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [anchor, onClose])

  return (
    <Menu
      open={Boolean(anchor)}
      anchorEl={anchor}
      onClose={onClose}
      className={styles.menu}
      data-testid={testId}
    >
      <div
        className={`overflow-y-auto max-h-[500px]`}
        data-testid={testId}
      >
        <MenuItem onClick={() => { onCreateNew(); onClose() }} data-testid="create-blank-snippet-item">
          <MaterialIcon name="add" size={16} style={{ marginRight: 8 }} aria-hidden="true" />
          {t.templatePicker.blank}
        </MenuItem>
        {sections.map((section) => (
          <div key={section.label}>
            <Divider />
            <div className={styles.sectionHeader} aria-hidden="true">{section.label}</div>
            <div className={styles.grid} role="group" aria-label={section.label}>
              {section.templates.map(template => (
                <button
                  key={template.id}
                  role="menuitem"
                  onClick={() => { onCreateFromTemplate(template.id); onClose() }}
                  className={styles.card}
                  data-testid={`template-${template.category}-${template.id}`}
                >
                  <span className={styles.cardTitle}>
                    {template.title}
                  </span>
                  <span className={styles.cardDescription}>
                    {template.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Menu>
  )
}
