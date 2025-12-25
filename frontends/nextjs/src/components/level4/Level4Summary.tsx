import type { AppConfiguration } from '@/lib/level-types'

interface Level4SummaryProps {
  appConfig: AppConfiguration
  nerdMode: boolean
}

export function Level4Summary({ appConfig, nerdMode }: Level4SummaryProps) {
  return (
    <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-dashed border-primary/30">
      <h3 className="font-semibold mb-2">Configuration Summary</h3>
      <div className="grid gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Data Models:</span>
          <span className="font-medium">{appConfig.schemas.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Total Fields:</span>
          <span className="font-medium">
            {appConfig.schemas.reduce((acc, s) => acc + s.fields.length, 0)}
          </span>
        </div>
        {nerdMode && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Workflows:</span>
              <span className="font-medium">{appConfig.workflows.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Workflow Nodes:</span>
              <span className="font-medium">
                {appConfig.workflows.reduce((acc, w) => acc + w.nodes.length, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lua Scripts:</span>
              <span className="font-medium">{appConfig.luaScripts.length}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
