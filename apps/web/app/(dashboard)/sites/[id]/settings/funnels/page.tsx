import { auth } from "@/lib/auth";
import { getSiteWrapper } from "@/lib/actions";
import FunnelsList from "@/components/sites/funnels-list";
import { headers } from "next/headers";

export default async function SettingsPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return null;
    }
    const site = await getSiteWrapper(params.id);
    if (!site) {
        return null;
    }
    const funnels = site.funnels;
    return (
        <FunnelsList funnels={funnels} site={site} />
    );
}
