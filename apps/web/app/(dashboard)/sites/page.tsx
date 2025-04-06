import { Suspense } from "react";
import Sites from "@/components/sites/sites";
import { CreateSiteModal } from "@/components/modal/create-site";
import { PlaceholderSiteCard } from "@/components/sites/site-card";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function AllSites({ params }: { params: { id: string } }) {
    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink asChild>
                                    <Link href="/sites">
                                        Personal Account
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    Settings
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 p-8 pt-0">
                <div className="flex flex-col space-y-6">
                    <div className="flex items-center justify-between">
                        <h1 className="font-cal text-3xl font-bold dark:text-white">
                            All Sites
                        </h1>
                        <CreateSiteModal />
                    </div>
                    <Suspense
                        fallback={
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <PlaceholderSiteCard />
                                ))}
                            </div>
                        }
                    >
                        <Sites />
                    </Suspense>
                </div>
            </main>
        </>
    );
}