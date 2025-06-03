import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar"
import { TeamSwitcher } from "@/components/team-switcher"
import { DocsNav } from "@/components/docs/nav"
import { getDocsTree } from "@/lib/docs"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    // Get the docs tree on the server
    const docsTree = getDocsTree();
    return (
        <SidebarProvider>
            <Sidebar collapsible="icon" className="top-16">
                <SidebarHeader>
                    <TeamSwitcher />
                </SidebarHeader>
                <SidebarContent>
                    <DocsNav docsTree={docsTree} />
                </SidebarContent>
                <SidebarRail />
            </Sidebar>
            <main>
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    )
}