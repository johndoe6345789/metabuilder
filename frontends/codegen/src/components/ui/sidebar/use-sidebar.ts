import { useContext } from "react"

import { SidebarContext } from "@/components/ui/sidebar/sidebar-context"

function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

export { useSidebar }
