import { useState } from 'react'
import { AIService } from '@/lib/ai-service'
import { ProjectFile } from '@/types/project'
import { toast } from 'sonner'
import fileExplorerCopy from '@/data/file-explorer.json'

interface UseFileExplorerDialogProps {
  onFileAdd: (file: ProjectFile) => void
}

export function useFileExplorerDialog({ onFileAdd }: UseFileExplorerDialogProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileLanguage, setNewFileLanguage] = useState('typescript')
  const [aiDescription, setAiDescription] = useState('')
  const [aiFileType, setAiFileType] = useState<'component' | 'page' | 'api' | 'utility'>(
    'component'
  )
  const [isGenerating, setIsGenerating] = useState(false)

  const handleAddFile = () => {
    if (!newFileName.trim()) return

    const newFile: ProjectFile = {
      id: `file-${Date.now()}`,
      name: newFileName,
      path: `/src/${newFileName}`,
      content: '',
      language: newFileLanguage,
    }

    onFileAdd(newFile)
    setNewFileName('')
    setIsAddDialogOpen(false)
  }

  const handleGenerateFileWithAI = async () => {
    if (!aiDescription.trim() || !newFileName.trim()) {
      toast.error(fileExplorerCopy.toast.missingFields)
      return
    }

    try {
      setIsGenerating(true)
      toast.info(fileExplorerCopy.toast.generating)

      const code = await AIService.generateCodeFromDescription(aiDescription, aiFileType)

      if (code) {
        const newFile: ProjectFile = {
          id: `file-${Date.now()}`,
          name: newFileName,
          path: `/src/${newFileName}`,
          content: code,
          language: newFileLanguage,
        }

        onFileAdd(newFile)
        setNewFileName('')
        setAiDescription('')
        setIsAddDialogOpen(false)
        toast.success(fileExplorerCopy.toast.generated)
      } else {
        toast.error(fileExplorerCopy.toast.generationFailed)
      }
    } catch (error) {
      toast.error(fileExplorerCopy.toast.generationError)
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    newFileName,
    setNewFileName,
    newFileLanguage,
    setNewFileLanguage,
    aiDescription,
    setAiDescription,
    aiFileType,
    setAiFileType,
    isGenerating,
    handleAddFile,
    handleGenerateFileWithAI,
  }
}
