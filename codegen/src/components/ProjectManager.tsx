import { useProjectManager } from '@/hooks/use-project-manager'
import { useProjectManagerDialogs } from '@/hooks/use-project-manager-dialogs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { FloppyDisk, FolderOpen, Trash, Copy, DownloadSimple, UploadSimple, Plus, FolderPlus } from '@phosphor-icons/react'
import { SavedProject } from '@/lib/project-service'
import { Project } from '@/types/project'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ProjectManagerProps {
  currentProject: Project
  onProjectLoad: (project: Project) => void
}

export function ProjectManager({ currentProject, onProjectLoad }: ProjectManagerProps) {
  const {
    projects,
    isLoading,
    loadProjectsList,
  } = useProjectManager()
  const {
    currentProjectId,
    projectName,
    projectDescription,
    importJson,
    saveDialogOpen,
    loadDialogOpen,
    newProjectDialogOpen,
    deleteDialogOpen,
    importDialogOpen,
    projectToDelete,
    setSaveDialogOpen,
    setLoadDialogOpen,
    setNewProjectDialogOpen,
    setDeleteDialogOpen,
    setImportDialogOpen,
    setProjectToDelete,
    setProjectName,
    setProjectDescription,
    setImportJson,
    handleSaveProject,
    handleLoadProject,
    handleDeleteProject,
    handleDuplicateProject,
    handleExportProject,
    handleImportProject,
    handleNewProject,
  } = useProjectManagerDialogs({ currentProject, onProjectLoad, loadProjectsList })

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <>
      <div className="flex gap-1 sm:gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={() => setSaveDialogOpen(true)} 
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <FloppyDisk size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save Project</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={() => setLoadDialogOpen(true)} 
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <FolderOpen size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Load Project</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={() => setNewProjectDialogOpen(true)} 
              variant="outline"
              size="icon"
              className="shrink-0 hidden md:flex"
            >
              <FolderPlus size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>New Project</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={() => setImportDialogOpen(true)} 
              variant="outline"
              size="icon"
              className="shrink-0 hidden md:flex"
            >
              <UploadSimple size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Import</TooltipContent>
        </Tooltip>
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
            <DialogDescription>
              Save your current project to the database
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="My Awesome Project"
              />
            </div>
            <div>
              <Label htmlFor="project-description">Description (Optional)</Label>
              <Textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Brief description of your project..."
                rows={3}
              />
            </div>
            {currentProjectId && (
              <Badge variant="secondary">
                This will update the existing project
              </Badge>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveProject}>
              <FloppyDisk size={16} className="mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Load Project</DialogTitle>
            <DialogDescription>
              Select a project to load from the database
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading projects...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <FolderOpen size={48} className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No saved projects</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {projects.map((project) => (
                  <Card
                    key={project.id}
                    className={cn(
                      'cursor-pointer hover:bg-accent transition-colors',
                      currentProjectId === project.id && 'border-primary'
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{project.name}</CardTitle>
                          {project.description && (
                            <CardDescription className="mt-1">
                              {project.description}
                            </CardDescription>
                          )}
                        </div>
                        {currentProjectId === project.id && (
                          <Badge variant="default">Current</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>Updated: {formatDate(project.updatedAt)}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleLoadProject(project)}
                      >
                        <FolderOpen size={14} className="mr-1" />
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDuplicateProject(project.id, project.name)
                        }}
                      >
                        <Copy size={14} className="mr-1" />
                        Duplicate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExportProject(project.id, project.name)
                        }}
                      >
                        <DownloadSimple size={14} className="mr-1" />
                        Export
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          setProjectToDelete(project.id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash size={14} className="mr-1" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <AlertDialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start New Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear your current workspace. Make sure you've saved your current project if you want to keep it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleNewProject}>
              <Plus size={16} className="mr-2" />
              Start New Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              <Trash size={16} className="mr-2" />
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Project</DialogTitle>
            <DialogDescription>
              Paste the JSON content of an exported project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder="Paste project JSON here..."
              rows={12}
              className="font-mono text-xs"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportProject}>
              <UploadSimple size={16} className="mr-2" />
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
