import { Nav } from "@/components/sidebar/nav";
import { TeamSwitcher } from "@/components/team/switcher";
import { SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Layout() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return null;
    }
    return (
        <>
            <SidebarHeader>
                <TeamSwitcher />
            </SidebarHeader>
            <SidebarContent>
                <Nav />
            </SidebarContent>
        </>
    );
}