/**
 * Navigation config barrel — re-exports tab info and nav groups.
 * Split to comply with ≤100 LOC rule:
 *   navigation-tab-info.tsx  — tabInfo map
 *   navigation-groups.tsx    — navigationGroups array
 */
export type { TabInfo } from './navigation-tab-info'
export { tabInfo } from './navigation-tab-info'
export type {
  NavigationItemData,
  NavigationGroup,
} from './navigation-groups'
export { navigationGroups } from './navigation-groups'
