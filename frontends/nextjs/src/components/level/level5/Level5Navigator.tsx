import { ArrowsLeftRight, Buildings, Camera, Eye, Users, Warning } from '@/fakemui/icons'

import { Box, Typography } from '@/fakemui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import type { AppLevel, Tenant, User } from '@/lib/level-types'

import { ErrorLogsTab } from '../../level5/tabs/error-logs/ErrorLogsTab'
import { GodUsersTab } from '../../level5/tabs/GodUsersTab'
import { PowerTransferTab } from '../../level5/tabs/power-transfer/PowerTransferTab'
import { PreviewTab } from '../../level5/tabs/PreviewTab'
import { TenantsTab } from '../../level5/tabs/TenantsTab'
import { ResultsPane } from '../sections/ResultsPane'

interface Level5NavigatorProps {
  tenants: Tenant[]
  allUsers: User[]
  godUsers: User[]
  transferRefresh: number
  currentUser: User
  onCreateTenant: () => void
  onDeleteTenant: (tenantId: string) => void
  onAssignHomepage: (tenantId: string, pageId: string) => Promise<void>
  onInitiateTransfer: (userId: string) => void
  onPreview: (level: AppLevel) => void
}

export function Level5Navigator({
  tenants,
  allUsers,
  godUsers,
  transferRefresh,
  currentUser,
  onCreateTenant,
  onDeleteTenant,
  onAssignHomepage,
  onInitiateTransfer,
  onPreview,
}: Level5NavigatorProps) {
  return (
    <ResultsPane
      title="Navigation"
      description="Jump between builder levels and administrative tools."
    >
      <Tabs defaultValue="tenants" className="space-y-6">
        <TabsList className="bg-black/40 border border-white/10">
          <TabsTrigger value="tenants" className="data-[state=active]:bg-purple-600">
            <Buildings className="w-4 h-4 mr-2" />
            Tenants
          </TabsTrigger>
          <TabsTrigger value="gods" className="data-[state=active]:bg-purple-600">
            <Users className="w-4 h-4 mr-2" />
            God Users
          </TabsTrigger>
          <TabsTrigger value="power" className="data-[state=active]:bg-purple-600">
            <ArrowsLeftRight className="w-4 h-4 mr-2" />
            Power Transfer
          </TabsTrigger>
          <TabsTrigger value="preview" className="data-[state=active]:bg-purple-600">
            <Eye className="w-4 h-4 mr-2" />
            Preview Levels
          </TabsTrigger>
          <TabsTrigger value="screenshot" className="data-[state=active]:bg-purple-600">
            <Camera className="w-4 h-4 mr-2" />
            Screenshot
          </TabsTrigger>
          <TabsTrigger value="errorlogs" className="data-[state=active]:bg-purple-600">
            <Warning className="w-4 h-4 mr-2" />
            Error Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenants" className="space-y-4">
          <TenantsTab
            tenants={tenants}
            allUsers={allUsers}
            onCreateTenant={onCreateTenant}
            onDeleteTenant={onDeleteTenant}
            onAssignHomepage={onAssignHomepage}
          />
        </TabsContent>

        <TabsContent value="gods" className="space-y-4">
          <GodUsersTab godUsers={godUsers} />
        </TabsContent>

        <TabsContent value="power" className="space-y-4">
          <PowerTransferTab
            currentUser={currentUser}
            allUsers={allUsers}
            onInitiateTransfer={onInitiateTransfer}
            refreshSignal={transferRefresh}
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <PreviewTab onPreview={onPreview} />
        </TabsContent>

        <TabsContent value="screenshot" className="space-y-4">
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Screenshot Analyzer is now a Lua package
            </Typography>
            <Typography variant="body2" color="text.secondary">
              See packages/screenshot_analyzer for the implementation
            </Typography>
          </Box>
        </TabsContent>

        <TabsContent value="errorlogs" className="space-y-4">
          <ErrorLogsTab user={currentUser} />
        </TabsContent>
      </Tabs>
    </ResultsPane>
  )
}
