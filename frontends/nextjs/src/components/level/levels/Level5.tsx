"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui'
import { Crown, Buildings, Users, ArrowsLeftRight, Eye, Camera } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Level5Header } from '../../level5/header/Level5Header'
import { TenantsTab } from '../../level5/tabs/TenantsTab'
import { GodUsersTab } from '../../level5/tabs/GodUsersTab'
import { PowerTransferTab } from '../../level5/tabs/PowerTransferTab'
import { PreviewTab } from '../../level5/tabs/PreviewTab'
import { ScreenshotAnalyzer } from '../../misc/demos/ScreenshotAnalyzer'
import { NerdModeIDE } from '../../misc/NerdModeIDE'
import type { User, AppLevel, Tenant } from '@/lib/level-types'
import { Database } from '@/lib/database'
import { createPowerTransferRequest } from '@/lib/api/power-transfers'
import { fetchUsers } from '@/lib/api/users/fetch-users'
import { useKV } from '@github/spark/hooks'

export interface Level5Props {
  user: User
  onLogout: () => void
  onNavigate: (level: AppLevel) => void
  onPreview: (level: AppLevel) => void
}

export function Level5({ user, onLogout, onNavigate, onPreview }: Level5Props) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [godUsers, setGodUsers] = useState<User[]>([])
  const [transferRefresh, setTransferRefresh] = useState(0)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showConfirmTransfer, setShowConfirmTransfer] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [newTenantName, setNewTenantName] = useState('')
  const [showCreateTenant, setShowCreateTenant] = useState(false)
  const [nerdMode, setNerdMode] = useKV<boolean>('level5-nerd-mode', false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [tenantsData, usersData] = await Promise.all([
      Database.getTenants(),
      fetchUsers(),
    ])
    
    setTenants(tenantsData)
    setAllUsers(usersData)
    setGodUsers(usersData.filter(u => u.role === 'god'))
  }

  const handleCreateTenant = async () => {
    if (!newTenantName.trim()) {
      toast.error('Tenant name is required')
      return
    }

    const newTenant: Tenant = {
      id: `tenant_${Date.now()}`,
      name: newTenantName,
      ownerId: user.id,
      createdAt: Date.now(),
    }

    await Database.addTenant(newTenant)
    setTenants(current => [...current, newTenant])
    setNewTenantName('')
    setShowCreateTenant(false)
    toast.success('Tenant created successfully')
  }

  const handleAssignHomepage = async (tenantId: string, pageId: string) => {
    await Database.updateTenant(tenantId, {
      homepageConfig: { pageId },
    })
    await loadData()
    toast.success('Homepage assigned to tenant')
  }

  const handleInitiateTransfer = (userId: string) => {
    if (!userId) {
      toast.error('Please select a user to transfer power to')
      return
    }
    setSelectedUserId(userId)
    setShowConfirmTransfer(true)
  }

  const handleConfirmTransfer = async () => {
    if (!selectedUserId) return

    const targetUser = allUsers.find((u) => u.id === selectedUserId)
    if (!targetUser) {
      toast.error('Selected user not found')
      setShowConfirmTransfer(false)
      return
    }

    try {
      await createPowerTransferRequest({
        fromUserId: user.id,
        toUserId: selectedUserId,
      })

      toast.success(
        `Power transferred to ${targetUser.username}. You are now a God user and will be logged out shortly.`
      )
      setTransferRefresh((prev) => prev + 1)
      await loadData()

      setTimeout(() => {
        onLogout()
      }, 2000)
    } catch (error) {
      toast.error('Failed to transfer power: ' + (error as Error).message)
    } finally {
      setShowConfirmTransfer(false)
      setSelectedUserId('')
    }
  }

  const handleDeleteTenant = async (tenantId: string) => {
    await Database.deleteTenant(tenantId)
    setTenants(current => current.filter(t => t.id !== tenantId))
    toast.success('Tenant deleted')
  }

  const handleToggleNerdMode = () => {
    setNerdMode(!nerdMode)
    toast.info(nerdMode ? 'Nerd Mode disabled' : 'Nerd Mode enabled')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950">
      <Level5Header
        username={user.username}
        nerdMode={nerdMode || false}
        onLogout={onLogout}
        onToggleNerdMode={handleToggleNerdMode}
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
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
          </TabsList>

          <TabsContent value="tenants" className="space-y-4">
            <TenantsTab
              tenants={tenants}
              allUsers={allUsers}
              onCreateTenant={() => setShowCreateTenant(true)}
              onDeleteTenant={handleDeleteTenant}
            />
          </TabsContent>

          <TabsContent value="gods" className="space-y-4">
            <GodUsersTab godUsers={godUsers} />
          </TabsContent>

          <TabsContent value="power" className="space-y-4">
          <PowerTransferTab
            currentUser={user}
            allUsers={allUsers}
            onInitiateTransfer={handleInitiateTransfer}
            refreshSignal={transferRefresh}
          />
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <PreviewTab onPreview={onPreview} />
          </TabsContent>

          <TabsContent value="screenshot" className="space-y-4">
            <ScreenshotAnalyzer />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showCreateTenant} onOpenChange={setShowCreateTenant}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Create New Tenant</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new tenant instance with its own homepage configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tenant-name">Tenant Name</Label>
              <Input
                id="tenant-name"
                value={newTenantName}
                onChange={(e) => setNewTenantName(e.target.value)}
                placeholder="Enter tenant name"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTenant(false)} className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={handleCreateTenant} className="bg-purple-600 hover:bg-purple-700">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmTransfer} onOpenChange={setShowConfirmTransfer}>
        <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-300">
              <Crown className="w-6 h-6" weight="fill" />
              Confirm Power Transfer
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you absolutely sure? This will transfer your Super God privileges to{' '}
              <span className="font-semibold text-white">
                {allUsers.find(u => u.id === selectedUserId)?.username}
              </span>
              . You will be downgraded to God level and cannot reverse this action.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmTransfer}
              className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
            >
              Transfer Power
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {nerdMode && (
        <div className="fixed bottom-4 right-4 w-[calc(100%-2rem)] max-w-[1400px] h-[600px] z-50 shadow-2xl">
          <NerdModeIDE />
        </div>
      )}
    </div>
  )
}
