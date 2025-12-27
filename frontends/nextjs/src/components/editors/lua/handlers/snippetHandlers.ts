import type { Dispatch, MutableRefObject, SetStateAction } from 'react'
import type { LuaScript } from '@/lib/level-types'

interface SnippetProps {
  currentScript: LuaScript | null
  handleUpdateScript: (updates: Partial<LuaScript>) => void
  editorRef: MutableRefObject<any>
  setShowSnippetLibrary: Dispatch<SetStateAction<boolean>>
}

interface FullscreenProps {
  isFullscreen: boolean
  setIsFullscreen: Dispatch<SetStateAction<boolean>>
}

export const createInsertSnippet = ({
  currentScript,
  handleUpdateScript,
  editorRef,
  setShowSnippetLibrary,
}: SnippetProps) => (code: string) => {
  if (!currentScript) return

  if (editorRef.current) {
    const selection = editorRef.current.getSelection()
    if (selection) {
      editorRef.current.executeEdits('', [
        {
          range: selection,
          text: code,
          forceMoveMarkers: true,
        },
      ])
      editorRef.current.focus()
    } else {
      const newCode = currentScript.code ? `${currentScript.code}\n\n${code}` : code
      handleUpdateScript({ code: newCode })
    }
  } else {
    const newCode = currentScript.code ? `${currentScript.code}\n\n${code}` : code
    handleUpdateScript({ code: newCode })
  }

  setShowSnippetLibrary(false)
}

export const createToggleFullscreen = ({ isFullscreen, setIsFullscreen }: FullscreenProps) => () => {
  setIsFullscreen(!isFullscreen)
}
