import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { DocSidebar } from "@/components/docs/doc-sidebar"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DocSidebar className="top-16" />
      <main>
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  )
}