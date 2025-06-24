import { getTeam } from "@repo/database";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { TeamSwitcher } from "@/components/team/switcher";
import { Nav } from "@/components/sidebar/nav";

type Params = Promise<{ slug?: string[] }>;

export default async function Page({ params }: { params: Params }) {
    const { slug } = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return null;
    }
    if (!slug || slug.length < 1) {
        return notFound();
    }

    console.log("slug", slug);

    const team = await getTeam(slug[1]!, session.user.id);

    return (
        <>
            <SidebarHeader>
                <TeamSwitcher currentTeam={team} />
            </SidebarHeader>
            <SidebarContent>
                <Nav teamId={team ? team.id : undefined} />
            </SidebarContent>
        </>
    )
}