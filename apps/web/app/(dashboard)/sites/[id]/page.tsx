import OverviewStats from "@/components/analytics/overview-stats";

export default function SitePage() {
    return (
        <div className="flex justify-center items-center">
            <div className="flex w-full max-w-screen-xl flex-col space-y-12 p-8">
                <div className="flex flex-col space-y-6">
                    <h1 className="text-3xl font-semibold dark:text-white">
                        Analytics
                    </h1>
                    <OverviewStats />
                </div>
            </div>
        </div>
    );
}