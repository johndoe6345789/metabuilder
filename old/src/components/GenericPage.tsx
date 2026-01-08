import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RenderComponent } from '@/components/RenderComponent'
import { SignOut, House, List, X } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { getPageRenderer, type PageDefinition, type PageContext } from '@/lib/page-renderer'
import type { User } from '@/lib/level-types'

interface GenericPageProps {
  pageId: string
  user: User | null
  level: number
  isPreviewMode?: boolean
  onNavigate: (level: number) => void
  onLogout?: () => void
}

export function GenericPage({ 
  pageId, 
  user, 
  level, 
  isPreviewMode = false, 
  onNavigate, 
  onLogout 
}: GenericPageProps) {
  const [page, setPage] = useState<PageDefinition | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)

  useEffect(() => {
    const loadPage = async () => {
      try {
        const renderer = getPageRenderer()
        await renderer.loadPages()
        
        const foundPage = renderer.getPage(pageId)
        if (!foundPage) {
          setError(`Page not found: ${pageId}`)
          setLoading(false)
          return
        }

        const permissionCheck = await renderer.checkPermissions(foundPage, user)
        if (!permissionCheck.allowed) {
          setError(permissionCheck.reason || 'Access denied')
          setLoading(false)
          return
        }

        setPage(foundPage)

        const context: PageContext = {
          user,
          level,
          isPreviewMode,
          navigationHandlers: {
            onNavigate,
            onLogout: onLogout || (() => {})
          },
          luaEngine: renderer['luaEngine']
        }

        await renderer.onPageLoad(foundPage, context)
        setLoading(false)

        return () => {
          renderer.onPageUnload(foundPage, context)
        }
      } catch (err) {
        console.error('Error loading page:', err)
        setError(err instanceof Error ? err.message : 'Failed to load page')
        setLoading(false)
      }
    }

    loadPage()
  }, [pageId, user, level, isPreviewMode])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => onNavigate(1)} className="w-full">
              <House className="mr-2" />
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!page) {
    return null
  }

  const renderHeader = () => {
    if (page.metadata?.showHeader === false) return null

    return (
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden"
            >
              {menuOpen ? <X /> : <List />}
            </Button>
            <h1 className="text-xl font-bold">
              {page.metadata?.headerTitle || page.title}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {page.metadata?.headerActions?.map((action, idx) => (
              <RenderComponent
                key={idx}
                component={action}
                isSelected={false}
                onSelect={() => {}}
                user={user || undefined}
              />
            ))}
            
            {user && onLogout && (
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <SignOut className="mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>
    )
  }

  const renderSidebar = () => {
    if (!page.metadata?.sidebarItems || page.metadata.sidebarItems.length === 0) {
      return null
    }

    return (
      <aside className="w-64 border-r border-border bg-card p-4 hidden lg:block">
        <nav className="space-y-2">
          {page.metadata.sidebarItems.map(item => (
            <Button
              key={item.id}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                if (item.action === 'navigate') {
                  onNavigate(parseInt(item.target))
                } else if (item.action === 'external') {
                  window.open(item.target, '_blank')
                }
              }}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Button>
          ))}
        </nav>
      </aside>
    )
  }

  const renderContent = () => {
    if (page.components.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No components configured for this page
          </p>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {page.components.map(component => (
          <RenderComponent
            key={component.id}
            component={component}
            isSelected={selectedComponentId === component.id}
            onSelect={setSelectedComponentId}
            user={user || undefined}
            contextData={{
              pageId: page.id,
              level,
              isPreviewMode
            }}
          />
        ))}
      </div>
    )
  }

  const renderLayout = () => {
    switch (page.layout) {
      case 'sidebar':
        return (
          <div className="flex min-h-screen">
            {renderSidebar()}
            <main className="flex-1">
              {renderHeader()}
              <div className="max-w-7xl mx-auto p-4">
                {renderContent()}
              </div>
            </main>
          </div>
        )

      case 'dashboard':
        return (
          <div className="min-h-screen">
            {renderHeader()}
            <div className="flex">
              {renderSidebar()}
              <main className="flex-1 p-6 bg-muted/20">
                {renderContent()}
              </main>
            </div>
          </div>
        )

      case 'blank':
        return (
          <div className="min-h-screen">
            {renderContent()}
          </div>
        )

      case 'default':
      default:
        return (
          <div className="min-h-screen">
            {renderHeader()}
            <main className="max-w-7xl mx-auto p-4">
              {renderContent()}
            </main>
            {page.metadata?.showFooter !== false && (
              <footer className="border-t border-border mt-12 py-6">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
                  <p>Powered by MetaBuilder</p>
                </div>
              </footer>
            )}
          </div>
        )
    }
  }

  return <>{renderLayout()}</>
}
