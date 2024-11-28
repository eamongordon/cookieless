import { auth } from "@/lib/auth";
import { getSiteWrapper } from "@/lib/actions";
import FunnelsList from "@/components/sites/funnels-list";
import { CreateFunnelButton } from "@/components/modal/create-funnel";

export default async function SettingsPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await auth();
    if (!session?.user) {
        return null;
    }
    const site = await getSiteWrapper(params.id);
    if (!site) {
        return null;
    }
    const funnels = site.funnels;
    return (
        <div>
            <FunnelsList funnels={funnels} site={site} />
        </div>
    );
}
