import { House,SignOut } from '@phosphor-icons/react'

import { Button } from '@/components/ui'
import { Avatar, AvatarFallback } from '@/components/ui'
import { Badge } from '@/components/ui'

interface AppHeaderProps {
  title?: string
  username?: string
  showAvatar?: boolean
  showBadge?: boolean
  onNavigateHome?: () => void
  onLogout?: () => void
  variant?: 'default' | 'admin' | 'user'
  children?: React.ReactNode
}

export function AppHeader({
  title = 'MetaBuilder',
  username,
  showAvatar = false,
  showBadge = false,
  onNavigateHome,
  onLogout,
  variant = 'default',
  children,
}: AppHeaderProps) {
  const getLogoGradient = () => {
    switch (variant) {
      case 'admin':
        return 'bg-gradient-to-br from-orange-500 to-orange-600'
      case 'user':
        return 'bg-gradient-to-br from-primary to-accent'
      default:
        return 'bg-gradient-to-br from-primary to-accent'
    }
  }

  const getBgClass = () => {
    switch (variant) {
      case 'admin':
        return 'bg-sidebar'
      case 'user':
        return 'bg-card'
      default:
        return 'bg-card'
    }
  }

  const getTextClass = () => {
    return variant === 'admin' ? 'text-sidebar-foreground' : ''
  }

  return (
    <nav className={`border-b border-border ${getBgClass()} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${getLogoGradient()}`} />
              <span className={`font-bold text-xl ${getTextClass()}`}>{title}</span>
            </div>
            {onNavigateHome && (
              <Button variant="ghost" size="sm" onClick={onNavigateHome} className={getTextClass()}>
                <House className="mr-2" size={16} />
                Home
              </Button>
            )}
            {children}
          </div>

          <div className="flex items-center gap-2">
            {username && showBadge && <Badge variant="secondary">{username}</Badge>}
            {username && showAvatar && (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">{username}</span>
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </>
            )}
            {onLogout && (
              <Button variant="ghost" size="sm" onClick={onLogout} className={getTextClass()}>
                <SignOut size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
