// Re-export all sidebar components from their modular files
// data-testid: "sidebar-*" and related components
export { SidebarProvider, useSidebar } from "./sidebar-context"
export { Sidebar, SidebarTrigger, SidebarRail, SidebarInset } from "./sidebar-core"
export {
  SidebarInput,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarContent,
  SidebarGroup,
} from "./sidebar-parts"
export { SidebarGroupLabel } from "./sidebar-menu/SidebarGroupLabel"
export { SidebarGroupAction } from "./sidebar-menu/SidebarGroupAction"
export { SidebarGroupContent } from "./sidebar-menu/SidebarGroupContent"
export { SidebarMenu } from "./sidebar-menu/SidebarMenu"
export { SidebarMenuItem } from "./sidebar-menu/SidebarMenuItem"
export { SidebarMenuButton } from "./sidebar-menu/SidebarMenuButton"
export { SidebarMenuAction } from "./sidebar-menu/SidebarMenuAction"
export { SidebarMenuBadge } from "./sidebar-menu/SidebarMenuBadge"
export { SidebarMenuSkeleton } from "./sidebar-menu/SidebarMenuSkeleton"
export { SidebarMenuSub } from "./sidebar-menu/SidebarMenuSub"
export { SidebarMenuSubItem } from "./sidebar-menu/SidebarMenuSubItem"
export { SidebarMenuSubButton } from "./sidebar-menu/SidebarMenuSubButton"
