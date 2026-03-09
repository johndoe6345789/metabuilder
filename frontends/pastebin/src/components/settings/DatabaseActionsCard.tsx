'use client'

import { useRef } from 'react'
import { Card, CardHeader, CardContent, Button, MaterialIcon } from '@metabuilder/components/fakemui'
import { useTranslation } from '@/hooks/useTranslation'
import styles from './settings-card.module.scss'

interface DatabaseActionsCardProps {
  onExport: () => Promise<void>
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onSeed: () => Promise<void>
  onClear: () => Promise<void>
}

export function DatabaseActionsCard({
  onExport,
  onImport,
  onSeed,
  onClear
}: DatabaseActionsCardProps) {
  const t = useTranslation()
  const s = t.settingsCards.actions
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <Card data-testid="database-actions-card">
      <CardHeader
        title={<h3 className={styles.cardTitle}>{s.title}</h3>}
        subheader={<p className={styles.cardDescription}>{s.description}</p>}
      />
      <CardContent>
        <div className={styles.contentStackSm}>
          <div data-testid="export-section">
            <h3 className={styles.actionSectionTitle}>{s.exportTitle}</h3>
            <p className={styles.actionSectionDesc}>
              {s.exportDesc}
            </p>
            <Button onClick={onExport} variant="outlined" className={styles.btnWithIcon} data-testid="export-db-btn" aria-label="Export database as file">
              <MaterialIcon name="download" size={16} aria-hidden="true" />
              {s.exportButton}
            </Button>
          </div>

          <div className={styles.actionSection} data-testid="import-section">
            <h3 className={styles.actionSectionTitle}>{s.importTitle}</h3>
            <p className={styles.actionSectionDesc}>
              {s.importDesc}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".db"
              onChange={onImport}
              className={styles.hiddenInput}
              id="import-db"
              data-testid="import-file-input"
              aria-label="Import database file"
            />
            <Button
              variant="outlined"
              className={styles.btnWithIcon}
              data-testid="import-db-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Import database file"
            >
              <MaterialIcon name="upload" size={16} aria-hidden="true" />
              {s.importButton}
            </Button>
          </div>

          <div className={styles.actionSection} data-testid="seed-section">
            <h3 className={styles.actionSectionTitle}>{s.seedTitle}</h3>
            <p className={styles.actionSectionDesc}>
              {s.seedDesc}
            </p>
            <Button onClick={onSeed} variant="outlined" className={styles.btnWithIcon} data-testid="seed-db-btn" aria-label="Add sample data to database">
              <MaterialIcon name="storage" size={16} aria-hidden="true" />
              {s.seedButton}
            </Button>
          </div>

          <div className={styles.actionSection} data-testid="clear-section">
            <h3 className={styles.actionSectionTitleDestructive}>{s.clearTitle}</h3>
            <p className={styles.actionSectionDesc}>
              {s.clearDesc}
            </p>
            <Button onClick={onClear} variant="danger" className={styles.btnWithIcon} data-testid="clear-db-btn" aria-label="Permanently delete all database contents">
              <MaterialIcon name="delete" size={16} aria-hidden="true" />
              {s.clearButton}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
