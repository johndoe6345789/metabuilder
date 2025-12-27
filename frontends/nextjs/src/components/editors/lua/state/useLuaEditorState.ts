import { useMemo, useRef, useState } from 'react'
import { useMonaco } from '@monaco-editor/react'
import type { LuaScript } from '@/lib/level-types'
import type { LuaExecutionResult } from '@/lib/lua-engine'
import type { SecurityScanResult } from '@/lib/security-scanner'
import {
  createAddScript,
  createDeleteScript,
  createUpdateScript,
} from '../handlers/scriptHandlers'
import {
  createAddParameter,
  createDeleteParameter,
  createUpdateParameter,
  createUpdateTestInput,
} from '../handlers/parameterHandlers'
import {
  createInsertSnippet,
  createToggleFullscreen,
} from '../handlers/snippetHandlers'
import {
  createProceedExecution,
  createScanCode,
  createTestScript,
} from '../handlers/executionHandlers'

interface UseLuaEditorStateProps {
  scripts: LuaScript[]
  onScriptsChange: (scripts: LuaScript[]) => void
}

export function useLuaEditorState({ scripts, onScriptsChange }: UseLuaEditorStateProps) {
  const [selectedScript, setSelectedScript] = useState<string | null>(
    scripts.length > 0 ? scripts[0].id : null
  )
  const [testOutput, setTestOutput] = useState<LuaExecutionResult | null>(null)
  const [testInputs, setTestInputs] = useState<Record<string, any>>({})
  const [isExecuting, setIsExecuting] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showSnippetLibrary, setShowSnippetLibrary] = useState(false)
  const [securityScanResult, setSecurityScanResult] = useState<SecurityScanResult | null>(null)
  const [showSecurityDialog, setShowSecurityDialog] = useState(false)
  const editorRef = useRef<any>(null)
  const monaco = useMonaco()

  const currentScript = useMemo(
    () => scripts.find(script => script.id === selectedScript) || null,
    [scripts, selectedScript]
  )

  const handleUpdateScript = createUpdateScript({
    scripts,
    onScriptsChange,
    selectedScript,
  })

  return {
    monaco,
    editorRef,
    currentScript,
    selectedScript,
    setSelectedScript,
    testOutput,
    setTestOutput,
    testInputs,
    setTestInputs,
    isExecuting,
    setIsExecuting,
    isFullscreen,
    setIsFullscreen,
    showSnippetLibrary,
    setShowSnippetLibrary,
    securityScanResult,
    setSecurityScanResult,
    showSecurityDialog,
    setShowSecurityDialog,
    handleAddScript: createAddScript({ scripts, onScriptsChange, setSelectedScript }),
    handleDeleteScript: createDeleteScript({ scripts, onScriptsChange, selectedScript, setSelectedScript }),
    handleUpdateScript,
    handleAddParameter: createAddParameter({ currentScript, handleUpdateScript }),
    handleDeleteParameter: createDeleteParameter({ currentScript, handleUpdateScript }),
    handleUpdateParameter: createUpdateParameter({ currentScript, handleUpdateScript }),
    handleUpdateTestInput: createUpdateTestInput({
      getTestInputs: () => testInputs,
      setTestInputs,
    }),
    handleInsertSnippet: createInsertSnippet({ currentScript, handleUpdateScript, editorRef, setShowSnippetLibrary }),
    handleToggleFullscreen: createToggleFullscreen({ isFullscreen, setIsFullscreen }),
    handleTestScript: createTestScript({
      getCurrentScript: () => currentScript,
      getTestInputs: () => testInputs,
      setIsExecuting,
      setTestOutput,
      setSecurityScanResult,
      setShowSecurityDialog,
    }),
    handleScanCode: createScanCode({
      getCurrentScript: () => currentScript,
      setSecurityScanResult,
      setShowSecurityDialog,
    }),
    handleProceedWithExecution: createProceedExecution({
      getCurrentScript: () => currentScript,
      getTestInputs: () => testInputs,
      setIsExecuting,
      setTestOutput,
      setShowSecurityDialog,
    }),
  }
}
