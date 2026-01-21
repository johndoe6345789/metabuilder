'use client';

import { motion } from 'framer-motion';
import { PersistenceSettings } from '@/components/demo/PersistenceSettings';
import { SchemaHealthCard } from '@/components/settings/SchemaHealthCard';
import { BackendAutoConfigCard } from '@/components/settings/BackendAutoConfigCard';
import { StorageBackendCard } from '@/components/settings/StorageBackendCard';
import { DatabaseStatsCard } from '@/components/settings/DatabaseStatsCard';
import { StorageInfoCard } from '@/components/settings/StorageInfoCard';
import { DatabaseActionsCard } from '@/components/settings/DatabaseActionsCard';
import { OpenAISettingsCard } from '@/components/settings/OpenAISettingsCard';
import { useSettingsState } from '@/hooks/useSettingsState';
import { PageLayout } from '../PageLayout';

export const dynamic = 'force-dynamic'

export default function SettingsPage() {
  const {
    stats,
    loading,
    storageBackend,
    setStorageBackend,
    flaskUrl,
    setFlaskUrl,
    flaskConnectionStatus,
    setFlaskConnectionStatus,
    testingConnection,
    envVarSet,
    schemaHealth,
    checkingSchema,
    handleExport,
    handleImport,
    handleClear,
    handleSeed,
    formatBytes,
    handleTestConnection,
    handleSaveStorageConfig,
    handleMigrateToFlask,
    handleMigrateToIndexedDB,
    checkSchemaHealth,
  } = useSettingsState();

  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Settings</h2>
          <p className="text-muted-foreground">Manage your database and application settings</p>
        </div>

        <div className="grid gap-6 max-w-3xl">
          <OpenAISettingsCard />
          
          <PersistenceSettings />

          <SchemaHealthCard 
            schemaHealth={schemaHealth}
            checkingSchema={checkingSchema}
            onClear={handleClear}
            onCheckSchema={checkSchemaHealth}
          />

          <BackendAutoConfigCard 
            envVarSet={envVarSet}
            flaskUrl={flaskUrl}
            flaskConnectionStatus={flaskConnectionStatus}
            testingConnection={testingConnection}
            onTestConnection={handleTestConnection}
          />
          
          <StorageBackendCard 
            storageBackend={storageBackend}
            flaskUrl={flaskUrl}
            flaskConnectionStatus={flaskConnectionStatus}
            testingConnection={testingConnection}
            envVarSet={envVarSet}
            onStorageBackendChange={setStorageBackend}
            onFlaskUrlChange={(url) => {
              setFlaskUrl(url);
              setFlaskConnectionStatus('unknown');
            }}
            onTestConnection={handleTestConnection}
            onSaveConfig={handleSaveStorageConfig}
            onMigrateToFlask={handleMigrateToFlask}
            onMigrateToIndexedDB={handleMigrateToIndexedDB}
          />

          <DatabaseStatsCard 
            loading={loading}
            stats={stats}
            formatBytes={formatBytes}
          />

          <StorageInfoCard storageType={stats?.storageType} />

          <DatabaseActionsCard 
            onExport={handleExport}
            onImport={handleImport}
            onSeed={handleSeed}
            onClear={handleClear}
          />
        </div>
      </motion.div>
    </PageLayout>
  );
}
