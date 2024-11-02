import OverviewStats from "@/components/analytics/overview-stats";
import { getStatsWrapper } from "@/lib/actions";
import { defaultStatsInput } from "@/lib/constants";

export default async function SitePage() {
    const data = await getStatsWrapper(defaultStatsInput);
    return (
        <div className="flex justify-center items-center">
            <div className="flex w-full max-w-screen-xl flex-col space-y-12 p-8">
                <div className="flex flex-col gap-6">
                    <h1 className="text-3xl font-semibold dark:text-white">
                        Analytics
                    </h1>
                    <OverviewStats initialData={data} />
                </div>
            </div>
        </div>
    );
}