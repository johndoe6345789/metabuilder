import { Download, Eye, House, SignOut, Terminal, Upload } from '@phosphor-icons/react'

import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'

interface Level4HeaderProps {
  username: string
  nerdMode: boolean
  onNavigate: (level: number) => void
  onPreview: (level: number) => void
  onLogout: () => void
  onToggleNerdMode: () => void
  onExportConfig: () => void
  onImportConfig: () => void
}

export function Level4Header({
  username,
  nerdMode,
  onNavigate,
  onPreview,
  onLogout,
  onToggleNerdMode,
  onExportConfig,
  onImportConfig,
}: Level4HeaderProps) {
  return (
    <nav className="border-b border-sidebar-border bg-sidebar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600" />
              <span className="font-bold text-xl text-sidebar-foreground">God-Tier Builder</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(1)}
              className="text-sidebar-foreground"
            >
              <House className="mr-2" size={16} />
              Home
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex gap-2 items-center">
              <div className="text-xs text-sidebar-foreground/70 font-medium mr-1">PREVIEW:</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(1)}
                className="bg-sidebar-accent hover:bg-sidebar-accent/80"
              >
                <Eye className="mr-2" size={16} />
                Level 1
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(2)}
                className="bg-sidebar-accent hover:bg-sidebar-accent/80"
              >
                <Eye className="mr-2" size={16} />
                Level 2
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(3)}
                className="bg-sidebar-accent hover:bg-sidebar-accent/80"
              >
                <Eye className="mr-2" size={16} />
                Level 3
              </Button>
            </div>
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Eye size={16} className="mr-2" />
                    Preview
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onPreview(1)}>
                    <Eye className="mr-2" size={16} />
                    Level 1 (Public)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPreview(2)}>
                    <Eye className="mr-2" size={16} />
                    Level 2 (User Area)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onPreview(3)}>
                    <Eye className="mr-2" size={16} />
                    Level 3 (Admin Panel)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="w-px h-6 bg-sidebar-border hidden sm:block" />
            <Button variant={nerdMode ? 'default' : 'outline'} size="sm" onClick={onToggleNerdMode}>
              <Terminal className="mr-2" size={16} />
              Nerd
            </Button>
            <Button variant="outline" size="sm" onClick={onExportConfig}>
              <Download size={16} />
            </Button>
            <Button variant="outline" size="sm" onClick={onImportConfig}>
              <Upload size={16} />
            </Button>
            <Badge variant="secondary">{username}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-sidebar-foreground"
            >
              <SignOut size={16} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
