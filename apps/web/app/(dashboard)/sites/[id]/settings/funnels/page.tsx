import { auth } from "@/lib/auth";
import { getSiteWrapper, listCustomPropertiesWrapper } from "@/lib/actions";
import FunnelsList from "@/components/sites/funnels-list";

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
        <FunnelsList funnels={funnels}/>
    );
}
