import { getSiteAndTeam } from "@repo/database";
import { TeamSwitcher } from "@/components/team-switcher";

type Params = Promise<{ slug?: string[] }>;

export default async function Page({ params }: { params: Params }) {
    const { slug } = await params;
    let site;
    if (slug && slug.length > 1) {
        console.log("slug", slug);
        site = await getSiteAndTeam(slug[1]!);
    } 
    return <TeamSwitcher currentSite={site} currentTeam={site ? site.team : undefined}/>
}