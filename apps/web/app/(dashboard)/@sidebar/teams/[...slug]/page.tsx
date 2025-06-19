import { getTeam } from "@repo/database";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { notFound } from "next/navigation";

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

    return <AppSidebar currentTeam={team} />
}