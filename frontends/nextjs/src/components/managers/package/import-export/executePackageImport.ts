import { installPackage } from '@/lib/api/packages'
import { importPackageFromZip } from '@/lib/packages/core/package-export'

export const executePackageImport = async (file: File) => {
  const { manifest, content, assets } = await importPackageFromZip(file)
  await installPackage(manifest.id, { manifest, content })

  return { manifest, content, assets }
}
