import { getSiteAndTeam } from "@repo/database";
import { TeamSwitcher } from "@/components/team-switcher";
import { AppSidebar } from "@/components/app-sidebar";

type Params = Promise<{ slug?: string[] }>;

export default async function Page({ params }: { params: Params }) {
    const { slug } = await params;
    let site;
    if (slug && slug.length > 1) {
        console.log("slugA", slug);
        site = await getSiteAndTeam(slug[1]!);
    }  else {
        console.log("slugB", slug);
    }
    return <AppSidebar currentSite={site} currentTeam={site ? site.team : undefined}/>
}