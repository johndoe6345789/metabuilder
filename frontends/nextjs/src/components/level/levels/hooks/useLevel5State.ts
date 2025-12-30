import { useKV } from '@/hooks/data/useKV'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { createPowerTransferRequest } from '@/lib/api/power-transfers'
import { fetchUsers } from '@/lib/api/users/fetch-users'
import { Database } from '@/lib/database'
import type { Tenant, User } from '@/lib/level-types'

interface Level5StateOptions {
  user: User
  onLogout: () => void
}

export function useLevel5State({ user, onLogout }: Level5StateOptions) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [godUsers, setGodUsers] = useState<User[]>([])
  const [transferRefresh, setTransferRefresh] = useState(0)
  const [showConfirmTransfer, setShowConfirmTransfer] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [newTenantName, setNewTenantName] = useState('')
  const [showCreateTenant, setShowCreateTenant] = useState(false)
  const [nerdMode, setNerdMode] = useKV<boolean>('level5-nerd-mode', false)

  useEffect(() => {
    void loadData()
  }, [])

  const loadData = async () => {
    const [tenantsData, usersData] = await Promise.all([Database.getTenants(), fetchUsers()])

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
    await Database.updateTenant(tenantId, { homepageConfig: { pageId } })
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

    const targetUser = allUsers.find(u => u.id === selectedUserId)
    if (!targetUser) {
      toast.error('Selected user not found')
      setShowConfirmTransfer(false)
      return
    }

    try {
      await createPowerTransferRequest({ fromUserId: user.id, toUserId: selectedUserId })

      toast.success(
        `Power transferred to ${targetUser.username}. You are now a God user and will be logged out shortly.`
      )
      setTransferRefresh(prev => prev + 1)
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

  return {
    tenants,
    allUsers,
    godUsers,
    transferRefresh,
    showConfirmTransfer,
    selectedUserId,
    newTenantName,
    showCreateTenant,
    nerdMode,
    setNewTenantName,
    setShowCreateTenant,
    setShowConfirmTransfer,
    setSelectedUserId,
    handleAssignHomepage,
    handleConfirmTransfer,
    handleCreateTenant,
    handleDeleteTenant,
    handleInitiateTransfer,
    handleToggleNerdMode,
    loadData,
  }
}
