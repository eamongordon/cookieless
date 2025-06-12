import { Globe } from "lucide-react";
import { SiteCard } from "./site-card";
import { sites } from "@repo/database/schema";

export type Site = typeof sites.$inferSelect;

export default async function AllSites({ sites }: { sites: Site[] }) {
    return sites.length > 0 ? (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))] xl:grid-cols-3">
            {sites.map((site) => (
                <SiteCard key={site.id} site={site} />
            ))}
        </div>
    ) : (
        <div className="flex-1 flex flex-col justify-center items-center gap-4">
            <span className="text-primary">
                <Globe height={50} width={50} strokeWidth={1.25} stroke="currentColor" />
            </span>
            <div className="flex justify-center items-center flex-col gap-2">
                <h1 className="text-3xl font-semibold">No Sites Yet</h1>
                <p className="text-lg text-muted-foreground">
                    You do&apos;nt have any sites yet. Create one to get started.
                </p>
            </div>
        </div>
    );
}