import { requestJson } from '@/lib/api/request-json'

export async function uninstallPackage(packageId: string): Promise<void> {
  await requestJson<{ deleted: boolean }>(`/api/packages/installed/${packageId}`, {
    method: 'DELETE',
  })
}
