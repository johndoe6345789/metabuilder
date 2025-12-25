import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Crown, SignOut, Terminal } from '@phosphor-icons/react'

interface Level5HeaderProps {
  username: string
  nerdMode: boolean
  onLogout: () => void
  onToggleNerdMode: () => void
}

export function Level5Header({ username, nerdMode, onLogout, onToggleNerdMode }: Level5HeaderProps) {
  return (
    <header className="bg-black/40 backdrop-blur-sm border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg">
            <Crown className="w-6 h-6 text-white" weight="fill" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Super God Panel</h1>
            <p className="text-sm text-gray-300">Multi-Tenant Control Center</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-yellow-200 border-yellow-500/50">
            <Crown className="w-3 h-3 mr-1" weight="fill" />
            {username}
          </Badge>
          <Button 
            variant={nerdMode ? "default" : "outline"} 
            size="sm" 
            onClick={onToggleNerdMode}
            className="text-white border-white/20 hover:bg-white/10"
          >
            <Terminal className="w-4 h-4 mr-2" />
            Nerd
          </Button>
          <Button variant="outline" size="sm" onClick={onLogout} className="text-white border-white/20 hover:bg-white/10">
            <SignOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
