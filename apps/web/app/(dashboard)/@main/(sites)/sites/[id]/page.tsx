import OverviewStats from "@/components/analytics/overview-stats";
import { getSiteWrapper, getStatsWrapper } from "@/lib/actions";
import { createDefaultStatsInput } from "@/lib/constants";

export default async function SitePage(
    props: {
        params: Promise<{ id: string }>;
    }
) {
    const params = await props.params;
    const site = await getSiteWrapper(params.id);
    const data = await getStatsWrapper(createDefaultStatsInput(site));
    return <OverviewStats initialData={data} site={site} />;
}