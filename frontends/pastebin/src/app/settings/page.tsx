'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { PersistenceSettings } from '@/components/demo/PersistenceSettings';
import { SchemaHealthCard } from '@/components/settings/SchemaHealthCard';
import { BackendAutoConfigCard } from '@/components/settings/BackendAutoConfigCard';
import { StorageBackendCard } from '@/components/settings/StorageBackendCard';
import { DatabaseStatsCard } from '@/components/settings/DatabaseStatsCard';
import { StorageInfoCard } from '@/components/settings/StorageInfoCard';
import { DatabaseActionsCard } from '@/components/settings/DatabaseActionsCard';
import { OpenAISettingsCard } from '@/components/settings/OpenAISettingsCard';
import { ProfileSettingsCard } from '@/components/settings/ProfileSettingsCard';
import { useSettingsState } from '@/hooks/useSettingsState';
import { useTranslation } from '@/hooks/useTranslation';
import { PageLayout } from '../PageLayout';
import styles from './settings-page.module.scss';

export const dynamic = 'force-dynamic'

type Tab = 'profile' | 'ai' | 'storage' | 'database';

export default function SettingsPage() {
  const t = useTranslation();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) ?? 'ai';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const {
    stats,
    loading,
    storageBackend,
    setStorageBackend,
    envVarSet,
    schemaHealth,
    checkingSchema,
    handleExport,
    handleImport,
    handleClear,
    handleSeed,
    formatBytes,
    handleSaveStorageConfig,
    checkSchemaHealth,
  } = useSettingsState();

  const tabs = t.settingsPage.tabs;

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

        <div className={styles.tabBar} role="tablist" aria-label="Settings sections">
          {(['profile', 'ai', 'storage', 'database'] as Tab[]).map(tab => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              aria-controls={`tabpanel-${tab}`}
              id={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
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
          {activeTab === 'profile' && (
            <ProfileSettingsCard />
          )}

          {activeTab === 'ai' && (
            <OpenAISettingsCard />
          )}

          {activeTab === 'storage' && (
            <>
              <BackendAutoConfigCard
                envVarSet={envVarSet}
              />
              <StorageBackendCard
                storageBackend={storageBackend}
                envVarSet={envVarSet}
                onStorageBackendChange={setStorageBackend}
                onSaveConfig={handleSaveStorageConfig}
              />
              <StorageInfoCard storageType={stats?.storageType} />
              <PersistenceSettings />
            </>
          )}

          {activeTab === 'database' && (
            <>
              <SchemaHealthCard
                schemaHealth={schemaHealth}
                checkingSchema={checkingSchema}
                onClear={handleClear}
                onCheckSchema={checkSchemaHealth}
              />
              <DatabaseStatsCard
                loading={loading}
                stats={stats}
                formatBytes={formatBytes}
              />
              <DatabaseActionsCard
                onExport={handleExport}
                onImport={handleImport}
                onSeed={handleSeed}
                onClear={handleClear}
              />
            </>
          )}
        </div>
      </motion.div>
    </PageLayout>
  );
}
