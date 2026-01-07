import { describe, expect, it } from 'vitest'

import adminDialogMetadata from '../../../../packages/admin_dialog/seed/metadata.json'
import arcadeLobbyMetadata from '../../../../packages/arcade_lobby/seed/metadata.json'
import auditLogMetadata from '../../../../packages/audit_log/seed/metadata.json'
import codeEditorMetadata from '../../../../packages/code_editor/seed/metadata.json'
import codegenStudioMetadata from '../../../../packages/codegen_studio/seed/metadata.json'
import componentEditorMetadata from '../../../../packages/component_editor/seed/metadata.json'
import configSummaryMetadata from '../../../../packages/config_summary/seed/metadata.json'
import cssDesignerMetadata from '../../../../packages/css_designer/seed/metadata.json'
import dashboardMetadata from '../../../../packages/dashboard/seed/metadata.json'
import dataTableMetadata from '../../../../packages/data_table/seed/metadata.json'
import databaseManagerMetadata from '../../../../packages/database_manager/seed/metadata.json'
import dbalDemoMetadata from '../../../../packages/dbal_demo/seed/metadata.json'
import dropdownManagerMetadata from '../../../../packages/dropdown_manager/seed/metadata.json'
import formBuilderMetadata from '../../../../packages/form_builder/seed/metadata.json'
import forumForgeMetadata from '../../../../packages/forum_forge/seed/metadata.json'
import githubToolsMetadata from '../../../../packages/github_tools/seed/metadata.json'
import ircWebchatMetadata from '../../../../packages/irc_webchat/seed/metadata.json'
import jsonScriptExampleMetadata from '../../../../packages/json_script_example/seed/metadata.json'
import mediaCenterMetadata from '../../../../packages/media_center/seed/metadata.json'
import navMenuMetadata from '../../../../packages/nav_menu/seed/metadata.json'
import nerdModeIdeMetadata from '../../../../packages/nerd_mode_ide/seed/metadata.json'
import notificationCenterMetadata from '../../../../packages/notification_center/seed/metadata.json'
import packageManagerMetadata from '../../../../packages/package_manager/seed/metadata.json'
import packageValidatorMetadata from '../../../../packages/package_validator/seed/metadata.json'
import quickGuideMetadata from '../../../../packages/quick_guide/seed/metadata.json'
import roleEditorMetadata from '../../../../packages/role_editor/seed/metadata.json'
import routeManagerMetadata from '../../../../packages/route_manager/seed/metadata.json'
import schemaEditorMetadata from '../../../../packages/schema_editor/seed/metadata.json'
import screenshotAnalyzerMetadata from '../../../../packages/screenshot_analyzer/seed/metadata.json'
import smtpConfigMetadata from '../../../../packages/smtp_config/seed/metadata.json'
import socialHubMetadata from '../../../../packages/social_hub/seed/metadata.json'
import statsGridMetadata from '../../../../packages/stats_grid/seed/metadata.json'
import streamCastMetadata from '../../../../packages/stream_cast/seed/metadata.json'
import testingMetadata from '../../../../packages/testing/seed/metadata.json'
import themeEditorMetadata from '../../../../packages/theme_editor/seed/metadata.json'
import uiAuthMetadata from '../../../../packages/ui_auth/seed/metadata.json'
import uiDialogsMetadata from '../../../../packages/ui_dialogs/seed/metadata.json'
import uiFooterMetadata from '../../../../packages/ui_footer/seed/metadata.json'
import uiHeaderMetadata from '../../../../packages/ui_header/seed/metadata.json'
import uiHomeMetadata from '../../../../packages/ui_home/seed/metadata.json'
import uiIntroMetadata from '../../../../packages/ui_intro/seed/metadata.json'
import uiLevel2Metadata from '../../../../packages/ui_level2/seed/metadata.json'
import uiLevel3Metadata from '../../../../packages/ui_level3/seed/metadata.json'
import uiLevel4Metadata from '../../../../packages/ui_level4/seed/metadata.json'
import uiLevel5Metadata from '../../../../packages/ui_level5/seed/metadata.json'
import uiLevel6Metadata from '../../../../packages/ui_level6/seed/metadata.json'
import uiLoginMetadata from '../../../../packages/ui_login/seed/metadata.json'
import uiPagesMetadata from '../../../../packages/ui_pages/seed/metadata.json'
import uiPermissionsMetadata from '../../../../packages/ui_permissions/seed/metadata.json'
import userManagerMetadata from '../../../../packages/user_manager/seed/metadata.json'
import workflowEditorMetadata from '../../../../packages/workflow_editor/seed/metadata.json'

const packages = [
  adminDialogMetadata,
  arcadeLobbyMetadata,
  auditLogMetadata,
  codeEditorMetadata,
  codegenStudioMetadata,
  componentEditorMetadata,
  configSummaryMetadata,
  cssDesignerMetadata,
  dashboardMetadata,
  dataTableMetadata,
  databaseManagerMetadata,
  dbalDemoMetadata,
  dropdownManagerMetadata,
  formBuilderMetadata,
  forumForgeMetadata,
  githubToolsMetadata,
  ircWebchatMetadata,
  jsonScriptExampleMetadata,
  mediaCenterMetadata,
  navMenuMetadata,
  nerdModeIdeMetadata,
  notificationCenterMetadata,
  packageManagerMetadata,
  packageValidatorMetadata,
  quickGuideMetadata,
  roleEditorMetadata,
  routeManagerMetadata,
  schemaEditorMetadata,
  screenshotAnalyzerMetadata,
  smtpConfigMetadata,
  socialHubMetadata,
  statsGridMetadata,
  streamCastMetadata,
  testingMetadata,
  themeEditorMetadata,
  uiAuthMetadata,
  uiDialogsMetadata,
  uiFooterMetadata,
  uiHeaderMetadata,
  uiHomeMetadata,
  uiIntroMetadata,
  uiLevel2Metadata,
  uiLevel3Metadata,
  uiLevel4Metadata,
  uiLevel5Metadata,
  uiLevel6Metadata,
  uiLoginMetadata,
  uiPagesMetadata,
  uiPermissionsMetadata,
  userManagerMetadata,
  workflowEditorMetadata,
]

describe('Package System Integration', () => {
  it('should have all packages with unique IDs', () => {
    const packageIds = packages.map(pkg => pkg.packageId)
    const uniqueIds = new Set(packageIds)
    expect(uniqueIds.size).toBe(packageIds.length)
  })

  it('should have all packages with valid versions', () => {
    packages.forEach(pkg => {
      expect(pkg.version).toMatch(/^\d+\.\d+\.\d+$/)
    })
  })

  it('should have all packages with metadata', () => {
    packages.forEach(pkg => {
      expect(pkg.packageId).toBeDefined()
      expect(pkg.name).toBeDefined()
      expect(pkg.description).toBeDefined()
      expect(pkg.author).toBeDefined()
    })
  })

  it('should have all packages with valid categories', () => {
    const validCategories = ['ui', 'utility', 'editor', 'management', 'media', 'testing', 'database', 'components', 'auth', 'data', 'system', 'integration']
    packages.forEach(pkg => {
      expect(validCategories).toContain(pkg.category)
    })
  })

  it('should have all packages with exports configuration', () => {
    packages.forEach(pkg => {
      expect(pkg.exports).toBeDefined()
      expect(pkg.exports.components).toBeInstanceOf(Array)
    })
  })

  it('should have all packages with dependencies array', () => {
    packages.forEach(pkg => {
      expect(pkg.dependencies).toBeInstanceOf(Array)
    })
  })

  it('should not have circular dependencies', () => {
    const getDependencies = (pkgId: string, visited = new Set<string>()): Set<string> => {
      if (visited.has(pkgId)) {
        throw new Error(`Circular dependency detected: ${pkgId}`)
      }
      visited.add(pkgId)

      const pkg = packages.find(p => p.packageId === pkgId)
      if (pkg === undefined) return visited

      pkg.dependencies.forEach((depId: string) => {
        getDependencies(depId, new Set(visited))
      })

      return visited
    }

    packages.forEach(pkg => {
      expect(() => getDependencies(pkg.packageId)).not.toThrow()
    })
  })

  it('should have all dependencies reference valid packages', () => {
    const allPackageIds = packages.map(pkg => pkg.packageId)

    packages.forEach(pkg => {
      pkg.dependencies.forEach((depId: string) => {
        expect(allPackageIds).toContain(depId)
      })
    })
  })
})
