import { getTeam } from "@repo/database";
import { TeamSwitcher } from "@/components/team-switcher";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type Params = Promise<{ slug?: string[] }>;

export default async function Page({ params }: { params: Params }) {
    const { slug } = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return null;
    }
    let team;
    if (slug && slug.length > 1) {
        team = await getTeam(slug[1]!, session.user.id);
    }
    console.log("SLUG", slug);
    return <TeamSwitcher currentTeam={team} />
}