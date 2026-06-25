/**
 * Navigation/menu JSON components — breadcrumbs, tabs, menus, etc.
 */
import { createJsonComponent } from './create-json-component'
import { createJsonComponentWithHooks } from './create-json-component-with-hooks'
import type {
  BreadcrumbProps,
  CommandPaletteProps,
  ContextMenuProps,
  DropdownMenuProps,
  MenuProps,
  NavigationGroupHeaderProps,
  NavigationItemProps,
  NavigationMenuProps,
  TabIconProps,
  TabsProps,
} from './interfaces'

import breadcrumbDef from '@/components/json-definitions/breadcrumb.json'
import commandPaletteDef from
  '@/components/json-definitions/command-palette.json'
import contextMenuDef from '@/components/json-definitions/context-menu.json'
import dropdownMenuDef from '@/components/json-definitions/dropdown-menu.json'
import menuDef from '@/components/json-definitions/menu.json'
import navigationGroupHeaderDef from
  '@/components/json-definitions/navigation-group-header.json'
import navigationItemDef from
  '@/components/json-definitions/navigation-item.json'
import navigationMenuDef from
  '@/components/json-definitions/navigation-menu.json'
import tabIconDef from '@/components/json-definitions/tab-icon.json'
import tabsDef from '@/components/json-definitions/tabs.json'

export const MetabuilderNavBreadcrumb =
  createJsonComponent<BreadcrumbProps>(breadcrumbDef)
export const MetabuilderWidgetCommandPalette =
  createJsonComponent<CommandPaletteProps>(commandPaletteDef)
export const MetabuilderNavContextMenu =
  createJsonComponent<ContextMenuProps>(contextMenuDef)
export const DropdownMenu =
  createJsonComponent<DropdownMenuProps>(dropdownMenuDef)
export const MetabuilderNavMenu =
  createJsonComponentWithHooks<MenuProps>(menuDef, {
    hooks: {
      menuState: {
        hookName: 'useMenuState',
        args: () => [],
      },
    },
  })
export const MetabuilderNavNavigationGroupHeader =
  createJsonComponent<NavigationGroupHeaderProps>(
    navigationGroupHeaderDef,
  )
export const MetabuilderNavNavigationItem =
  createJsonComponent<NavigationItemProps>(navigationItemDef)
export const MetabuilderNavNavigationMenu =
  createJsonComponentWithHooks<NavigationMenuProps>(
    navigationMenuDef,
    {
      hooks: {
        menuState: {
          hookName: 'useNavigationMenu',
          args: (props) => [
            props.featureToggles,
            props.errorCount || 0,
            props.activeTab,
            props.onTabChange,
          ],
        },
      },
    },
  )
export const MetabuilderNavTabIcon =
  createJsonComponent<TabIconProps>(tabIconDef)
export const MetabuilderNavTabs =
  createJsonComponent<TabsProps>(tabsDef)
