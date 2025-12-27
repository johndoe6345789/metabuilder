import { Card, CardContent } from '@/components/ui'
import { LuaCodeEditorSection } from './code/LuaCodeEditorSection'
import { LuaScriptDetails } from './configuration/LuaScriptDetails'
import { LuaScriptsListCard } from './configuration/LuaScriptsListCard'
import { LuaExecutionPreview } from './execution/LuaExecutionPreview'
import { LuaLintingControls } from './linting/LuaLintingControls'
import { LuaEditorToolbar } from './toolbar/LuaEditorToolbar'
import { useLuaEditorLogic } from './useLuaEditorLogic'
import type { LuaScript } from '@/lib/level-types'

interface LuaEditorProps {
  scripts: LuaScript[]
  onScriptsChange: (scripts: LuaScript[]) => void
}

export const LuaEditor = ({ scripts, onScriptsChange }: LuaEditorProps) => {
  const {
    currentScript,
    selectedScriptId,
    testOutput,
    testInputs,
    isExecuting,
    isFullscreen,
    showSnippetLibrary,
    securityScanResult,
    showSecurityDialog,
    setSelectedScriptId,
    setIsFullscreen,
    setShowSnippetLibrary,
    setShowSecurityDialog,
    handleAddScript,
    handleDeleteScript,
    handleUpdateScript,
    handleAddParameter,
    handleDeleteParameter,
    handleUpdateParameter,
    handleTestInputChange,
    handleScanCode,
    handleTestScript,
    handleProceedWithExecution,
  } = useLuaEditorLogic({ scripts, onScriptsChange })

  if (!currentScript) {
    return (
      <div className="grid md:grid-cols-3 gap-6 h-full">
        <LuaScriptsListCard
          scripts={scripts}
          selectedScriptId={selectedScriptId}
          onAddScript={handleAddScript}
          onDeleteScript={handleDeleteScript}
          onSelectScript={setSelectedScriptId}
        />
        <Card className="md:col-span-2">
          <CardContent className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground">
              <p>Select or create a script to edit</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 h-full">
      <LuaScriptsListCard
        scripts={scripts}
        selectedScriptId={selectedScriptId}
        onAddScript={handleAddScript}
        onDeleteScript={handleDeleteScript}
        onSelectScript={setSelectedScriptId}
      />

      <Card className="md:col-span-2">
        <LuaEditorToolbar
          script={currentScript}
          isExecuting={isExecuting}
          onScan={handleScanCode}
          onTest={handleTestScript}
        />
        <LuaScriptDetails
          script={currentScript}
          testInputs={testInputs}
          onUpdateScript={handleUpdateScript}
          onAddParameter={handleAddParameter}
          onDeleteParameter={handleDeleteParameter}
          onUpdateParameter={handleUpdateParameter}
          onTestInputChange={handleTestInputChange}
        />
        <CardContent className="space-y-6">
          <LuaCodeEditorSection
            script={currentScript}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            showSnippetLibrary={showSnippetLibrary}
            onShowSnippetLibraryChange={setShowSnippetLibrary}
            onUpdateScript={handleUpdateScript}
          />
          <LuaExecutionPreview result={testOutput} />
        </CardContent>
      </Card>

      <LuaLintingControls
        scanResult={securityScanResult}
        showDialog={showSecurityDialog}
        onDialogChange={setShowSecurityDialog}
        onProceed={handleProceedWithExecution}
      />
    </div>
  )
}
