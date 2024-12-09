import OverviewStats from "@/components/analytics/overview-stats";
import { getSiteWrapper, getStatsWrapper } from "@/lib/actions";
import { createDefaultStatsInput } from "@/lib/constants";

export default async function SitePage({
    params,
}: {
    params: { id: string };
}) {
    const site = await getSiteWrapper(params.id);
    const data = await getStatsWrapper(createDefaultStatsInput(site));
    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-semibold dark:text-white">
                Analytics
            </h1>
            <OverviewStats initialData={data} site={site} />
        </div>
    );
}