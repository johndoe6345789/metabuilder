import { useEffect } from 'react'
import { toast } from '@/components/ui/sonner'
import { useReduxFiles } from '@/hooks/use-redux-files'
import { useReduxComponentTrees } from '@/hooks/use-redux-component-trees'
import { useReduxSync } from '@/hooks/use-redux-sync'
import { useAppSelector } from '@/store'
import { ComponentTreesCard } from '@/components/redux-integration/ComponentTreesCard'
import { FilesCard } from '@/components/redux-integration/FilesCard'
import { ReduxIntegrationHeader } from '@/components/redux-integration/ReduxIntegrationHeader'
import { StatusCardsSection } from '@/components/redux-integration/StatusCardsSection'
import reduxIntegrationCopy from '@/data/redux-integration-demo.json'

export function ReduxIntegrationDemo() {
  const { files, load: loadFiles, save: saveFile, remove: removeFile } = useReduxFiles()
  const { trees, load: loadTrees } = useReduxComponentTrees()
  const {
    status,
    lastSyncedAt,
    dbalConnected,
    dbalStats,
    syncToDBAL,
    syncFromDBAL,
    checkConnection,
  } = useReduxSync()
  const settings = useAppSelector((state) => state.settings.settings)

  useEffect(() => {
    loadFiles()
    loadTrees()
  }, [loadFiles, loadTrees])

  const handleCreateTestFile = () => {
    const newFile = {
      id: `file-${Date.now()}`,
      name: `test-${Date.now()}.tsx`,
      content: '// Test file created via Redux',
      language: 'typescript',
      path: '/test',
      updatedAt: Date.now(),
    }
    saveFile(newFile)
    toast.success(reduxIntegrationCopy.toast.createTestFile)
  }

  const handleDeleteFile = (fileId: string) => {
    removeFile(fileId)
    toast.success(reduxIntegrationCopy.toast.deleteFile)
  }

  const handleSyncUp = () => {
    syncToDBAL()
    toast.info(reduxIntegrationCopy.toast.syncUp)
  }

  const handleSyncDown = () => {
    syncFromDBAL()
    toast.info(reduxIntegrationCopy.toast.syncDown)
  }

  return (
    <div className="h-full w-full overflow-auto p-6 space-y-6">
      <div className="max-w-7xl mx-auto">
        <ReduxIntegrationHeader />
        <StatusCardsSection
          filesCount={files.length}
          treesCount={trees.length}
          dbalConnected={dbalConnected}
          dbalStats={dbalStats}
          status={status}
          lastSyncedAt={lastSyncedAt}
          autoSyncEnabled={settings.autoSync}
          onCreateTestFile={handleCreateTestFile}
          onCheckConnection={checkConnection}
          onSyncUp={handleSyncUp}
          onSyncDown={handleSyncDown}
        />
        <FilesCard files={files} onDeleteFile={handleDeleteFile} />
        <ComponentTreesCard trees={trees} />
      </div>
    </div>
  )
}
