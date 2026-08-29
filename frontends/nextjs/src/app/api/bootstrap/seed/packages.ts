/** The packages a fresh instance starts with. */

export const SEED_PACKAGES = [
  {
    packageId: 'package_manager',
    version: '1.0.0',
    enabled: true,
    config:
      '{"autoUpdate":false,"systemPackage":true,"uninstallProtection":true}',
  },
  {
    packageId: 'ui_header',
    version: '1.0.0',
    enabled: true,
    config: '{"systemPackage":true}',
  },
  {
    packageId: 'ui_footer',
    version: '1.0.0',
    enabled: true,
    config: '{"systemPackage":true}',
  },
  {
    packageId: 'ui_home',
    version: '1.0.0',
    enabled: true,
    config: '{"systemPackage":true,"defaultRoute":"/","publicAccess":true}',
  },
  {
    packageId: 'ui_auth',
    version: '1.0.0',
    enabled: true,
    config: '{"systemPackage":true}',
  },
  {
    packageId: 'ui_login',
    version: '1.0.0',
    enabled: true,
    config: '{"systemPackage":true}',
  },
  {
    packageId: 'dashboard',
    version: '1.0.0',
    enabled: true,
    config: '{"systemPackage":true,"defaultRoute":"/"}',
  },
  {
    packageId: 'user_manager',
    version: '1.0.0',
    enabled: true,
    config: '{"systemPackage":true,"minLevel":4}',
  },
  {
    packageId: 'role_editor',
    version: '1.0.0',
    enabled: true,
    config: '{"systemPackage":false,"minLevel":4}',
  },
  {
    packageId: 'admin_dialog',
    version: '1.0.0',
    enabled: true,
    config: '{"systemPackage":false,"minLevel":4}',
  },
  {
    packageId: 'database_manager',
    version: '1.0.0',
    enabled: true,
    config: '{"systemPackage":false,"minLevel":5,"dangerousOperations":true}',
  },
  {
    packageId: 'schema_editor',
    version: '1.0.0',
    enabled: true,
    config: '{"systemPackage":false,"minLevel":5,"dangerousOperations":true}',
  },
]
