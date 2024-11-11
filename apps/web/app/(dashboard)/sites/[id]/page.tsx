import OverviewStats from "@/components/analytics/overview-stats";
import { getStatsWrapper } from "@/lib/actions";
import { createDefaultStatsInput } from "@/lib/constants";

export default async function SitePage({
    params,
}: {
    params: { id: string };
}) {
    const data = await getStatsWrapper(createDefaultStatsInput(params.id));
    return (
        <div className="flex justify-center items-center">
            <div className="flex w-full max-w-screen-xl flex-col space-y-12 p-8">
                <div className="flex flex-col gap-6">
                    <h1 className="text-3xl font-semibold dark:text-white">
                        Analytics
                    </h1>
                    <OverviewStats initialData={data} siteId={params.id} />
                </div>
            </div>
        </div>
    );
}