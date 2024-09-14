import { Suspense } from "react";
import Sites from "@/components/sites/sites";
import { CreateSiteButton } from "@/components/sites/create-site";
import { PlaceholderSiteCard } from "@/components/sites/site-card";

export default function AllSites({ params }: { params: { id: string } }) {
    return (
        <div className="flex max-w-screen-xl flex-col space-y-12 p-8">
            <div className="flex flex-col space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="font-cal text-3xl font-bold dark:text-white">
                        All Sites
                    </h1>
                    <CreateSiteButton />
                </div>
                <Suspense
                    fallback={
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <PlaceholderSiteCard/>
                            ))}
                        </div>
                    }
                >
                    <Sites />
                </Suspense>
            </div>
        </div>
    );
}