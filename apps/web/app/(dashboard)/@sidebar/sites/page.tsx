import { TeamSwitcher } from "@/components/team/switcher";
import { SidebarHeader, SidebarContent } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Nav } from "@/components/sidebar/nav";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return null;
    }
    return (
        <>
            <SidebarHeader>
                <TeamSwitcher userSubscriptonStatus={session.user.subscriptionStatus} />
            </SidebarHeader>
            <SidebarContent>
                <Nav />
            </SidebarContent>
        </>
    );
}