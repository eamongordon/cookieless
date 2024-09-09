import { getUserSitesWrapper } from "@/lib/actions";
import SiteCard from "./site-card";

export default async function AllSites() {
    const sites = await getUserSitesWrapper();
    return sites.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {sites.map((site) => (
                <SiteCard key={site.siteId} site={site} />
            ))}
        </div>
    ) : (
        <div className="mt-20 flex flex-col items-center space-x-4">
            <h1 className="text-4xl">No Sites Yet</h1>
            <p className="text-lg text-stone-500">
                You do not have any sites yet. Create one to get started.
            </p>
        </div>
    );
}