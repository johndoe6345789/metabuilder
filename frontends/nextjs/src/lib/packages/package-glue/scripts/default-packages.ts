/**
 * @file default-packages.ts
 * @description Default package definitions aggregated from individual package modules
 */

import { adminDialog } from './packages/admin-dialog'
import { dataTable } from './packages/data-table'
import { formBuilder } from './packages/form-builder'
import { navMenu } from './packages/nav-menu'
import type { PackageSeedConfig } from './types'

export type { PackageSeedConfig }

export const DEFAULT_PACKAGES: Record<string, PackageSeedConfig> = {
  admin_dialog: adminDialog,
  data_table: dataTable,
  form_builder: formBuilder,
  nav_menu: navMenu,
}
