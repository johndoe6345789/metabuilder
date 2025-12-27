// NavigationMenu barrel export - maintains backward compatibility after splitting into smaller organisms
// Components split into separate files to keep each under 150 LOC
export {
  NavigationMenuCore as NavigationMenu,
  type NavigationMenuProps,
  NavigationMenuList,
  NavigationMenuItem,
} from './NavigationMenuCore'
export {
  NavigationMenuTrigger,
  NavigationMenuContent,
} from './NavigationMenuTrigger'
export {
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from './NavigationMenuLink'
