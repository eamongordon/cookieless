import { getUserSitesWrapper } from "@/lib/actions";
import { SiteCard } from "./site-card";

export default async function AllSites() {
    const sites = await getUserSitesWrapper();
    return sites.length > 0 ? (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))] xl:grid-cols-3">
            {sites.map((site) => (
                <SiteCard key={site.id} site={site} />
            ))}
        </div>
    ) : (
        <div className="mt-20 flex flex-col items-center space-y-4">
            <h1 className="text-4xl">No Sites Yet</h1>
            <p className="text-lg text-stone-500">
                You do not have any sites yet. Create one to get started.
            </p>
        </div>
    );
}