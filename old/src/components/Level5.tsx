import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Crown, Users, House, ArrowsLeftRight, Shield, Eye, SignOut, Buildings, Terminal } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { User, AppLevel, Tenant, PowerTransferRequest } from '@/lib/level-types'
import { Database } from '@/lib/database'
import { NerdModeIDE } from './NerdModeIDE'
import { useKV } from '@github/spark/hooks'

interface Level5Props {
  user: User
  onLogout: () => void
  onNavigate: (level: AppLevel) => void
  onPreview: (level: AppLevel) => void
}

export function Level5({ user, onLogout, onNavigate, onPreview }: Level5Props) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [godUsers, setGodUsers] = useState<User[]>([])
  const [transferRequests, setTransferRequests] = useState<PowerTransferRequest[]>([])
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
    const [tenantsData, usersData, requestsData] = await Promise.all([
      Database.getTenants(),
      Database.getUsers(),
      Database.getPowerTransferRequests(),
    ])
    
    setTenants(tenantsData)
    setAllUsers(usersData)
    setGodUsers(usersData.filter(u => u.role === 'god'))
    setTransferRequests(requestsData.filter(r => r.status === 'pending' && r.expiresAt > Date.now()))
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

  const handleInitiateTransfer = () => {
    if (!selectedUserId) {
      toast.error('Please select a user to transfer power to')
      return
    }
    setShowConfirmTransfer(true)
  }

  const handleConfirmTransfer = async () => {
    if (!selectedUserId) return

    try {
      const newSuperGodUser = allUsers.find(u => u.id === selectedUserId)
      if (!newSuperGodUser) {
        toast.error('Selected user not found')
        return
      }

      await Database.transferSuperGodPower(user.id, selectedUserId)
      
      toast.success(`Power transferred to ${newSuperGodUser.username}. You are now a God user.`)
      
      setTimeout(() => {
        onLogout()
      }, 2000)
    } catch (error) {
      toast.error('Failed to transfer power: ' + (error as Error).message)
    }
    
    setShowConfirmTransfer(false)
    setShowTransferDialog(false)
  }

  const handleDeleteTenant = async (tenantId: string) => {
    await Database.deleteTenant(tenantId)
    setTenants(current => current.filter(t => t.id !== tenantId))
    toast.success('Tenant deleted')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950">
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
              {user.username}
            </Badge>
            <Button 
              variant={nerdMode ? "default" : "outline"} 
              size="sm" 
              onClick={() => {
                setNerdMode(!nerdMode)
                toast.info(nerdMode ? 'Nerd Mode disabled' : 'Nerd Mode enabled')
              }}
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
          </TabsList>

          <TabsContent value="tenants" className="space-y-4">
            <Card className="bg-black/40 border-white/10 text-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tenant Management</CardTitle>
                    <CardDescription className="text-gray-400">
                      Create and manage tenants with custom homepages
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateTenant(true)} className="bg-purple-600 hover:bg-purple-700">
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
                                  onClick={() => handleDeleteTenant(tenant.id)}
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
          </TabsContent>

          <TabsContent value="gods" className="space-y-4">
            <Card className="bg-black/40 border-white/10 text-white">
              <CardHeader>
                <CardTitle>God-Level Users</CardTitle>
                <CardDescription className="text-gray-400">
                  All users with God access level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-3">
                    {godUsers.map(godUser => (
                      <Card key={godUser.id} className="bg-white/5 border-white/10">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Shield className="w-8 h-8 text-purple-400" weight="fill" />
                              <div>
                                <p className="font-semibold text-white">{godUser.username}</p>
                                <p className="text-sm text-gray-400">{godUser.email}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-purple-300 border-purple-500/50">
                              God
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="power" className="space-y-4">
            <Card className="bg-black/40 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Transfer Super God Power</CardTitle>
                <CardDescription className="text-gray-400">
                  Transfer your Super God privileges to another user. You will be downgraded to God.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex gap-3">
                    <Crown className="w-6 h-6 text-amber-400 flex-shrink-0" weight="fill" />
                    <div>
                      <h4 className="font-semibold text-amber-200 mb-1">Critical Action</h4>
                      <p className="text-sm text-amber-300/80">
                        This action cannot be undone. Only one Super God can exist at a time. After transfer, you will have God-level access only.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Select User to Transfer Power To:</h4>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {allUsers
                        .filter(u => u.id !== user.id && u.role !== 'supergod')
                        .map(u => (
                          <Card
                            key={u.id}
                            className={`cursor-pointer transition-all ${
                              selectedUserId === u.id
                                ? 'bg-purple-600/30 border-purple-500'
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                            onClick={() => setSelectedUserId(u.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-white">{u.username}</p>
                                  <p className="text-sm text-gray-400">{u.email}</p>
                                </div>
                                <Badge variant="outline" className="text-gray-300 border-gray-500/50">
                                  {u.role}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </ScrollArea>
                </div>

                <Button
                  onClick={handleInitiateTransfer}
                  disabled={!selectedUserId}
                  className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
                  size="lg"
                >
                  <ArrowsLeftRight className="w-5 h-5 mr-2" />
                  Initiate Power Transfer
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card className="bg-black/40 border-white/10 text-white">
              <CardHeader>
                <CardTitle>Preview Application Levels</CardTitle>
                <CardDescription className="text-gray-400">
                  View how each level appears to different user roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onPreview(1)}>
                    <CardHeader>
                      <CardTitle className="text-white">Level 1: Public</CardTitle>
                      <CardDescription className="text-gray-400">Landing page and public content</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onPreview(2)}>
                    <CardHeader>
                      <CardTitle className="text-white">Level 2: User Area</CardTitle>
                      <CardDescription className="text-gray-400">User dashboard and profile</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onPreview(3)}>
                    <CardHeader>
                      <CardTitle className="text-white">Level 3: Admin Panel</CardTitle>
                      <CardDescription className="text-gray-400">Data management interface</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => onPreview(4)}>
                    <CardHeader>
                      <CardTitle className="text-white">Level 4: God Panel</CardTitle>
                      <CardDescription className="text-gray-400">System builder interface</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
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
