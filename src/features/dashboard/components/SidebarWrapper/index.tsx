"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "../AppSidebar"

interface SidebarWrapperProps {
  children: React.ReactNode
}

// ✅ IMPORTANTE: Named export
export function SidebarWrapper({ children }: SidebarWrapperProps) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
         
        </header>
        <div className="flex-1 p-6">{children}</div>
      </main>
    </SidebarProvider>
  )
}
