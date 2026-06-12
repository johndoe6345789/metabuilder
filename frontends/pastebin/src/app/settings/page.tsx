'use client'

import { motion } from 'framer-motion'
import { PersistenceSettings } from '@/components/demo/PersistenceSettings'
import { SchemaHealthCard } from '@/components/settings/SchemaHealthCard'
// eslint-disable-next-line max-len
import { BackendAutoConfigCard } from '@/components/settings/BackendAutoConfigCard'
import { StorageBackendCard } from '@/components/settings/StorageBackendCard'
import { DatabaseStatsCard } from '@/components/settings/DatabaseStatsCard'
import { StorageInfoCard } from '@/components/settings/StorageInfoCard'
import { DatabaseActionsCard } from '@/components/settings/DatabaseActionsCard'
import { OpenAISettingsCard } from '@/components/settings/OpenAISettingsCard'
import { ProfileSettingsCard } from '@/components/settings/ProfileSettingsCard'
import { useTranslation } from '@/hooks/useTranslation'
import { PageLayout } from '../PageLayout'
import { useSettingsPage, type Tab } from './hooks/useSettingsPage'
import styles from './settings-page.module.scss'

export const dynamic = 'force-dynamic'

const ALL_TABS: Tab[] = ['profile', 'ai', 'storage', 'database']

export default function SettingsPage() {
  const t = useTranslation()
  const { activeTab, handleTabChange, settings } = useSettingsPage()
  const tabs = t.settingsPage.tabs

  return (
    <PageLayout>
      <motion.div
        data-testid="settings-page"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.pageHeader}>
          <h2 className={styles.pageHeading}>{t.settingsPage.heading}</h2>
          <p className={styles.pageSubtitle}>{t.settingsPage.subtitle}</p>
        </div>

        <div
          className={styles.tabBar}
          role="tablist"
          aria-label="Settings sections"
        >
          {ALL_TABS.map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`tabpanel-${tab}`}
              id={`tab-${tab}`}
              onClick={() => handleTabChange(tab)}
              className={`${styles.tabBtn} ${
                activeTab === tab ? styles.tabBtnActive : ''
              }`}
            >
              {tabs?.[tab] ?? tab}
            </button>
          ))}
        </div>

        <div
          className={styles.cardGrid}
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === 'profile' && <ProfileSettingsCard />}

          {activeTab === 'ai' && <OpenAISettingsCard />}

          {activeTab === 'storage' && (
            <>
              <BackendAutoConfigCard envVarSet={settings.envVarSet} />
              <StorageBackendCard
                storageBackend={settings.storageBackend}
                envVarSet={settings.envVarSet}
                onStorageBackendChange={settings.setStorageBackend}
                onSaveConfig={settings.handleSaveStorageConfig}
              />
              <StorageInfoCard storageType={settings.stats?.storageType} />
              <PersistenceSettings />
            </>
          )}

          {activeTab === 'database' && (
            <>
              <SchemaHealthCard
                schemaHealth={settings.schemaHealth}
                checkingSchema={settings.checkingSchema}
                onClear={settings.handleClear}
                onCheckSchema={settings.checkSchemaHealth}
              />
              <DatabaseStatsCard
                loading={settings.loading}
                stats={settings.stats}
                formatBytes={settings.formatBytes}
              />
              <DatabaseActionsCard
                onExport={settings.handleExport}
                onImport={settings.handleImport}
                onSeed={settings.handleSeed}
                onClear={settings.handleClear}
              />
            </>
          )}
        </div>
      </motion.div>
    </PageLayout>
  )
}
