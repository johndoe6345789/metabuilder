'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface StorageInfoCardProps {
  storageType?: 'indexeddb' | 'localstorage' | 'none'
}

export function StorageInfoCard({ storageType }: StorageInfoCardProps) {
  return (
    <Card data-testid="storage-info-card">
      <CardHeader>
        <CardTitle>Storage Information</CardTitle>
        <CardDescription>
          How your data is stored
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert role="status" aria-label="Storage type information">
          <AlertDescription data-testid="storage-type-description">
            {storageType === 'indexeddb' ? (
              <>
                <strong>IndexedDB</strong> is being used for storage. This provides better performance and
                larger storage capacity compared to localStorage. Your data persists locally in your browser.
              </>
            ) : storageType === 'localstorage' ? (
              <>
                <strong>localStorage</strong> is being used for storage. IndexedDB is not available in your
                browser. Note that localStorage has a smaller storage limit (typically 5-10MB).
              </>
            ) : (
              <>
                No persistent storage detected. Your data will be lost when you close the browser.
              </>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
