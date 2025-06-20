import { getSiteAndTeam } from "@repo/database";
import { SidebarContent, SidebarHeader } from "@/components/ui/sidebar";
import { TeamSwitcher } from "@/components/team/switcher";
import { Nav } from "@/components/sidebar/nav";

type Params = Promise<{ slug?: string[] }>;

export default async function Layout({ params }: { params: Params }) {
    const { slug } = await params;
    let site;
    if (slug && slug.length > 1) {
        console.log("slugA", slug);
        site = await getSiteAndTeam(slug[1]!);
    } else {
        console.log("slugB", slug);
    }
    return (
        <>
            <SidebarHeader>
                <TeamSwitcher currentTeam={site?.team ? site.team : undefined} currentSite={site} />
            </SidebarHeader>
            <SidebarContent>
                <Nav teamId={site?.team ? site.team.id : undefined} />
            </SidebarContent>
        </>
    );
}