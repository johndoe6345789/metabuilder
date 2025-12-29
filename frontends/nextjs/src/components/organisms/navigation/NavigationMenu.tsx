// NavigationMenu barrel export - maintains backward compatibility after splitting into smaller organisms
// Components split into separate files to keep each under 150 LOC
export {
  NavigationMenuCore as NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  type NavigationMenuProps,
} from './NavigationMenuCore'
export {
  NavigationMenuIndicator,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
  NavigationMenuViewport,
} from './NavigationMenuLink'
export { NavigationMenuContent,NavigationMenuTrigger } from './NavigationMenuTrigger'
