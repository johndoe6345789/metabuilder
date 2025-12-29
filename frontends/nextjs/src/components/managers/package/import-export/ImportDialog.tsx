import { ArrowSquareIn, FileArrowUp } from '@phosphor-icons/react'
import type React from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'

import { ImportStatus } from './StatusUI'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileInputRef: React.RefObject<HTMLInputElement>
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void
  importing: boolean
}

export const ImportDialog = ({
  open,
  onOpenChange,
  fileInputRef,
  onFileSelect,
  importing,
}: ImportDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <ArrowSquareIn size={24} weight="duotone" className="text-white" />
          </div>
          <div>
            <DialogTitle>Import Package</DialogTitle>
            <DialogDescription>Import a package from a ZIP file</DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <ImportStatus
        importing={importing}
        selectionSlot={
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileArrowUp size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="font-medium mb-1">Click to select a package file</p>
            <p className="text-sm text-muted-foreground">Supports .zip files only</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={onFileSelect}
              className="hidden"
            />
          </div>
        }
      />
    </DialogContent>
  </Dialog>
)
