import { Card, CardContent } from '@/components/ui'
import { SecurityWarningDialog } from '@/components/organisms/security/SecurityWarningDialog'
import { LuaEditorToolbar } from './LuaEditorToolbar'
import { LuaCodeEditorView } from './LuaCodeEditorView'
import { LuaBlocksBridge } from './LuaBlocksBridge'
import { LuaScriptsSidebar } from './LuaScriptsSidebar'
import { useLuaEditorState } from './state/useLuaEditorState'
import { useLuaEditorPersistence } from './persistence/useLuaEditorPersistence'
import type { LuaScript } from '@/lib/level-types'

interface LuaEditorProps {
  scripts: LuaScript[]
  onScriptsChange: (scripts: LuaScript[]) => void
}

export function LuaEditor({ scripts, onScriptsChange }: LuaEditorProps) {
  const state = useLuaEditorState({ scripts, onScriptsChange })

  useLuaEditorPersistence({
    monaco: state.monaco,
    currentScript: state.currentScript,
    setTestInputs: state.setTestInputs,
  })

  return (
    <div className="grid md:grid-cols-3 gap-6 h-full">
      <LuaScriptsSidebar
        scripts={scripts}
        selectedScript={state.selectedScript}
        onSelect={state.setSelectedScript}
        onAdd={state.handleAddScript}
        onDelete={state.handleDeleteScript}
      />

      <Card className="md:col-span-2">
        {!state.currentScript ? (
          <CardContent className="flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center text-muted-foreground">
              <p>Select or create a script to edit</p>
            </div>
          </CardContent>
        ) : (
          <>
            <LuaEditorToolbar
              scriptName={state.currentScript.name}
              onScan={state.handleScanCode}
              onTest={state.handleTestScript}
              isExecuting={state.isExecuting}
            />
            <CardContent className="space-y-6">
              <LuaBlocksBridge
                currentScript={state.currentScript}
                testInputs={state.testInputs}
                testOutput={state.testOutput}
                onAddParameter={state.handleAddParameter}
                onDeleteParameter={state.handleDeleteParameter}
                onUpdateParameter={state.handleUpdateParameter}
                onUpdateScript={state.handleUpdateScript}
                onUpdateTestInput={state.handleUpdateTestInput}
              />

              <LuaCodeEditorView
                currentScript={state.currentScript}
                isFullscreen={state.isFullscreen}
                showSnippetLibrary={state.showSnippetLibrary}
                onSnippetLibraryChange={state.setShowSnippetLibrary}
                onInsertSnippet={state.handleInsertSnippet}
                onToggleFullscreen={state.handleToggleFullscreen}
                onUpdateCode={code => state.handleUpdateScript({ code })}
                editorRef={state.editorRef}
              />
            </CardContent>
          </>
        )}
      </Card>

      {state.securityScanResult && (
        <SecurityWarningDialog
          open={state.showSecurityDialog}
          onOpenChange={state.setShowSecurityDialog}
          scanResult={state.securityScanResult}
          onProceed={state.handleProceedWithExecution}
          onCancel={() => state.setShowSecurityDialog(false)}
          codeType="Lua script"
          showProceedButton={true}
        />
      )}
    </div>
  )
}
