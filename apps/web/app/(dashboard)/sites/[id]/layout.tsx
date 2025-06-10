import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { getSiteNameAndTeam } from "@repo/database";
import Link from "next/link";

export default async function SitePageLayout(
    props: {
        children: React.ReactNode;
        params: Promise<{
            id: string;
        }>
    }
) {
    const params = await props.params;

    const {
        children
    } = props;

    const siteRes = await getSiteNameAndTeam(params.id);
    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                <div className="flex items-center gap-2 px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink asChild>
                                    <Link href={siteRes.team ? `/teams/${siteRes.team.id}` : "/dashboard"}>
                                        {siteRes.team ? siteRes.team.name : "My Sites"}
                                    </Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>
                                    {siteRes.siteName}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-8 pt-0">
                {children}
            </div>
        </>
    );
}