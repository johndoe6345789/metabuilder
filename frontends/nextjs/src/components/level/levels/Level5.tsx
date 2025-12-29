'use client'

import type { AppLevel,User } from '@/lib/level-types'

import { Level5Header } from '../../level5/header/Level5Header'
import { NerdModeIDE } from '../../misc/NerdModeIDE'
import { CreateTenantDialog } from '../level5/CreateTenantDialog'
import { Level5Navigator } from '../level5/Level5Navigator'
import { TransferConfirmDialog } from '../level5/TransferConfirmDialog'
import { IntroSection } from '../sections/IntroSection'
import { useLevel5State } from './hooks/useLevel5State'

export interface Level5Props {
  user: User
  onLogout: () => void
  onNavigate: (level: AppLevel) => void
  onPreview: (level: AppLevel) => void
}

export function Level5({ user, onLogout, onNavigate: _onNavigate, onPreview }: Level5Props) {
  const {
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
  } = useLevel5State({ user, onLogout })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950">
      <Level5Header
        username={user.username}
        nerdMode={nerdMode || false}
        onLogout={onLogout}
        onToggleNerdMode={handleToggleNerdMode}
      />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <IntroSection
          eyebrow="Level 5"
          title="Super God Panel"
          description="Govern tenants, manage god users, and handle cross-level operations."
        />

        <Level5Navigator
          tenants={tenants}
          allUsers={allUsers}
          godUsers={godUsers}
          transferRefresh={transferRefresh}
          currentUser={user}
          onCreateTenant={() => setShowCreateTenant(true)}
          onDeleteTenant={handleDeleteTenant}
          onAssignHomepage={handleAssignHomepage}
          onInitiateTransfer={handleInitiateTransfer}
          onPreview={onPreview}
        />
      </main>

      <CreateTenantDialog
        open={showCreateTenant}
        newTenantName={newTenantName}
        onChangeTenantName={setNewTenantName}
        onClose={setShowCreateTenant}
        onCreate={handleCreateTenant}
      />

      <TransferConfirmDialog
        open={showConfirmTransfer}
        allUsers={allUsers}
        selectedUserId={selectedUserId}
        onClose={setShowConfirmTransfer}
        onConfirm={handleConfirmTransfer}
      />

      {nerdMode && (
        <div className="fixed bottom-4 right-4 w-[calc(100%-2rem)] max-w-[1400px] h-[600px] z-50 shadow-2xl">
          <NerdModeIDE />
        </div>
      )}
    </div>
  )
}
