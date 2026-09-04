'use client'

import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setPackages, type GodState } from '@/store/slices/god-slice'
import type { RegistryPackage } from './package-registry/types'
import { usePackageCrud } from './package-registry/use-package-crud'
import { usePackageLifecycle } from './package-registry/use-package-lifecycle'
import { usePublishPackage } from './package-registry/use-publish-package'

export type { PackageRef, RegistryPackage } from './package-registry/types'

export function usePackageRegistry() {
  const dispatch = useAppDispatch()
  const packages = useAppSelector(s => (s.god as GodState).packages)
  const persist = useCallback(
    (next: RegistryPackage[]) => {
      dispatch(setPackages(next))
    },
    [dispatch]
  )

  const crud = usePackageCrud({ packages, persist })
  const lifecycle = usePackageLifecycle({ packages, persist })
  const { publish, publishing } = usePublishPackage({ packages, persist })

  return {
    packages,
    ...crud,
    ...lifecycle,
    publish,
    publishing,
  }
}
