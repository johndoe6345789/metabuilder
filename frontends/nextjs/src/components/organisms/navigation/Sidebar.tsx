// Sidebar barrel export - maintains backward compatibility after splitting into smaller organisms
// Components split into separate files to keep each under 150 LOC
export { SidebarCore as Sidebar, type SidebarProps } from './SidebarCore'
export { SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger } from './SidebarExtras'
export { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from './SidebarGroup'
export { SidebarContent, SidebarFooter, SidebarHeader, SidebarInset } from './SidebarLayout'
export { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './SidebarMenu'
