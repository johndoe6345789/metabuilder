// Sidebar barrel export - maintains backward compatibility after splitting into smaller organisms
// Components split into separate files to keep each under 150 LOC
export { SidebarCore as Sidebar, type SidebarProps } from './SidebarCore'
export {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
} from './SidebarLayout'
export {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from './SidebarMenu'
export {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from './SidebarGroup'
export {
  SidebarSeparator,
  SidebarTrigger,
  SidebarRail,
  SidebarProvider,
} from './SidebarExtras'
