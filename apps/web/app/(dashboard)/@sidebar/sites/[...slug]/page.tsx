import { getSiteNameAndTeam } from "@repo/database";
import { TeamSwitcher } from "@/components/team-switcher";

type Params = Promise<{ slug?: string[] }>;

export default async function Page({ params }: { params: Params }) {
    const { slug } = await params;
    let site;
    if (slug && slug.length > 1) {
        console.log("slug", slug);
        site = await getSiteNameAndTeam(slug[1]!);
    } 
    return <TeamSwitcher currentSiteName={site?.siteName} currentTeamName={site ? site.team?.name : undefined}/>
}