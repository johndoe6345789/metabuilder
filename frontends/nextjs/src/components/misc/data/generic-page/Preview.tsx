import { Eye, Layout, ShieldCheck } from '@/fakemui/icons'

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
} from '@/components/ui'
import { PageDefinition } from '@/lib/rendering/page/page-renderer'

interface GenericPagePreviewProps {
  page: PageDefinition
  updatedAt?: string
  footerText?: string
}

const layoutCopy: Record<PageDefinition['layout'], string> = {
  default: 'Default layout with header and footer',
  sidebar: 'Sidebar layout with navigation',
  dashboard: 'Dashboard layout with widgets',
  blank: 'Blank canvas for custom layouts',
}

export function Preview({ page, updatedAt, footerText }: GenericPagePreviewProps) {
  const showHeader = page.metadata?.showHeader !== false
  const showFooter = page.metadata?.showFooter !== false

  return (
    <Card className="h-full">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2">
          <Eye size={20} weight="duotone" />
          Page preview
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-muted-foreground">
          <Layout size={16} />
          {layoutCopy[page.layout]}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {page.description || 'No description provided.'}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="capitalize">
                Level {page.level}
              </Badge>
              <Badge variant="secondary">{page.components.length} components</Badge>
              {page.permissions?.requiresAuth && (
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck size={14} />
                  Auth required
                  {page.permissions?.requiredRole ? ` (${page.permissions.requiredRole})` : ''}
                </span>
              )}
              {updatedAt && <span>Last updated {updatedAt}</span>}
            </div>
          </div>
          <Badge>{page.metadata?.headerTitle || page.title}</Badge>
        </div>

        <div className="rounded-lg border bg-card p-4 shadow-inner">
          {showHeader && (
            <div className="mb-3 flex items-center justify-between rounded-md border border-dashed border-border/60 bg-muted/60 px-3 py-2 text-sm">
              <span className="font-semibold">Header</span>
              <Badge variant="outline">{page.metadata?.headerTitle || 'Default title'}</Badge>
            </div>
          )}

          <div
            className={`grid gap-3 ${page.layout === 'dashboard' ? 'lg:grid-cols-3 md:grid-cols-2 grid-cols-1' : ''} ${
              page.layout === 'sidebar' ? 'lg:grid-cols-[240px_1fr]' : ''
            }`}
          >
            {page.layout === 'sidebar' && (
              <div className="rounded-md border border-dashed border-border/60 bg-muted/50 p-3 text-sm text-muted-foreground">
                Sidebar navigation
              </div>
            )}

            <div className="space-y-3 rounded-md border border-dashed border-border/60 bg-background p-3">
              <p className="text-sm font-semibold">Component tree</p>
              <div className="grid gap-2 md:grid-cols-2">
                {page.components.slice(0, 4).map(component => (
                  <div
                    key={component.id}
                    className="rounded border bg-muted/40 p-2 text-xs text-muted-foreground"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{component.type}</span>
                      {component.children && component.children.length > 0 && (
                        <Badge variant="outline">{component.children.length} children</Badge>
                      )}
                    </div>
                    {component.props?.className && (
                      <p className="line-clamp-1">{component.props.className}</p>
                    )}
                  </div>
                ))}
                {page.components.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add components to see them previewed here.
                  </p>
                )}
              </div>
            </div>
          </div>

          {showFooter && (
            <div className="mt-3 flex items-center justify-between rounded-md border border-dashed border-border/60 bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
              <span>Footer</span>
              <Badge variant="secondary">{footerText || 'Configured in metadata'}</Badge>
            </div>
          )}
        </div>

        <Separator />

        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-foreground">Lua hooks</p>
            <p>onLoad: {page.luaScripts?.onLoad || 'Not configured'}</p>
            <p>onUnload: {page.luaScripts?.onUnload || 'Not configured'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-foreground">Metadata</p>
            <p>Header actions: {page.metadata?.headerActions?.length ?? 0}</p>
            <p>Sidebar items: {page.metadata?.sidebarItems?.length ?? 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
