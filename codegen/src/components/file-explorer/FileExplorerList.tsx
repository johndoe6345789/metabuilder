import { FileCode, Folder } from '@phosphor-icons/react'
import { ProjectFile } from '@/types/project'

interface FileExplorerListProps {
  files: ProjectFile[]
  activeFileId: string | null
  onFileSelect: (fileId: string) => void
}

export function FileExplorerList({
  files,
  activeFileId,
  onFileSelect,
}: FileExplorerListProps) {
  const groupedFiles = files.reduce((acc, file) => {
    const dir = file.path.split('/').slice(0, -1).join('/') || '/'
    if (!acc[dir]) acc[dir] = []
    acc[dir].push(file)
    return acc
  }, {} as Record<string, ProjectFile[]>)

  return (
    <div className="p-2">
      {Object.entries(groupedFiles).map(([dir, dirFiles]) => (
        <div key={dir} className="mb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 px-2">
            <Folder size={14} />
            <span>{dir}</span>
          </div>
          <div className="space-y-0.5">
            {dirFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => onFileSelect(file.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                  activeFileId === file.id
                    ? 'bg-accent text-accent-foreground'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <FileCode size={16} />
                <span className="truncate">{file.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
