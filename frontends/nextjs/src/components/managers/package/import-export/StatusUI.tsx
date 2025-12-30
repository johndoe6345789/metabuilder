import { CheckCircle, Warning } from '@/fakemui/icons'
import type { ReactNode } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'

interface ImportStatusProps {
  importing: boolean
  selectionSlot: ReactNode
}

export const ImportStatus = ({ importing, selectionSlot }: ImportStatusProps) => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Select Package File</CardTitle>
        <CardDescription>Choose a .zip file containing a MetaBuilder package</CardDescription>
      </CardHeader>
      <CardContent>
        {selectionSlot}
        {importing && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Importing package...</span>
          </div>
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="text-lg">What's Included in Packages?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            'Data schemas',
            'Page configurations',
            'Workflows',
            'Lua scripts',
            'Component hierarchies',
            'CSS configurations',
            'Assets (images, etc.)',
            'Seed data',
          ].map(item => (
            <div key={item} className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
      <Warning size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Import Warning</p>
        <p className="text-yellow-800 dark:text-yellow-200">
          Imported packages will be merged with existing data. Make sure to back up your database
          before importing.
        </p>
      </div>
    </div>
  </div>
)
