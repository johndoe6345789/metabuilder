import { Database } from '@/lib/database'
import type { User } from '@/lib/level-types'
import { toast } from 'sonner'

export async function markErrorResolved(id: string, reload: () => Promise<void>, user?: User) {
  try {
    await Database.updateErrorLog(id, {
      resolved: true,
      resolvedAt: Date.now(),
      resolvedBy: user?.username || 'admin',
    })
    await reload()
    toast.success('Error log marked as resolved')
  } catch (error) {
    toast.error('Failed to update error log')
  }
}

export async function deleteErrorLog(id: string, reload: () => Promise<void>) {
  try {
    await Database.deleteErrorLog(id)
    await reload()
    toast.success('Error log deleted')
  } catch (error) {
    toast.error('Failed to delete error log')
  }
}

export async function clearErrorLogs(
  clearOnlyResolved: boolean,
  reload: () => Promise<void>,
  onCleared?: () => void
) {
  try {
    const count = await Database.clearErrorLogs(clearOnlyResolved)
    await reload()
    toast.success(`Cleared ${count} error log${count !== 1 ? 's' : ''}`)
    onCleared?.()
  } catch (error) {
    toast.error('Failed to clear error logs')
  }
}
