import { Buildings, House } from '@/fakemui/icons'

import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { ScrollArea } from '@/components/ui'
import { Badge } from '@/components/ui'
import type { Tenant, User } from '@/lib/level-types'

interface TenantsTabProps {
  tenants: Tenant[]
  allUsers: User[]
  onCreateTenant: () => void
  onDeleteTenant: (tenantId: string) => void
}

export function TenantsTab({ tenants, allUsers, onCreateTenant, onDeleteTenant }: TenantsTabProps) {
  return (
    <Card className="bg-black/40 border-white/10 text-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tenant Management</CardTitle>
            <CardDescription className="text-gray-400">
              Create and manage tenants with custom homepages
            </CardDescription>
          </div>
          <Button onClick={onCreateTenant} className="bg-purple-600 hover:bg-purple-700">
            <Buildings className="w-4 h-4 mr-2" />
            Create Tenant
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {tenants.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Buildings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tenants created yet</p>
              </div>
            ) : (
              tenants.map(tenant => {
                const owner = allUsers.find(u => u.id === tenant.ownerId)
                return (
                  <Card key={tenant.id} className="bg-white/5 border-white/10">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-white">{tenant.name}</CardTitle>
                          <CardDescription className="text-gray-400">
                            Owner: {owner?.username || 'Unknown'}
                          </CardDescription>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDeleteTenant(tenant.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-400">
                          Created: {new Date(tenant.createdAt).toLocaleDateString()}
                        </p>
                        {tenant.homepageConfig && (
                          <Badge variant="outline" className="text-green-400 border-green-500/50">
                            <House className="w-3 h-3 mr-1" />
                            Homepage Configured
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
