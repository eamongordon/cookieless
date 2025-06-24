import { ReactNode } from "react";
import { getSiteWrapper } from "@/lib/actions";
import SiteSettingsNav from "@/components/sites/settings-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import { getTeam } from "@repo/database";
import { auth } from "@repo/database";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export default async function UserSettingsLayout({
    children,
    params
}: {
    children: ReactNode;
    params: Promise<{ id: string }>
}) {

    const { id } = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return null;
    }

    const team = await getTeam(id, session.user.id);

    if (!team) {
        return notFound();
    }

    const navItems = [
        {
            name: "General",
            href: `/teams/${id}/settings`,
            segment: null,
        },
        {
            name: "Billing",
            href: `/teams/${id}/settings/billing`,
            segment: "billing",
        },
        {
            name: "People",
            href: `/teams/${id}/settings/people`,
            segment: "people",
        }
    ]

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
                                    <Link href="/sites">
                                        {team.name}
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
                <h1 className="text-xl font-bold dark:text-white sm:text-3xl">
                    Settings for {team.name}
                </h1>
                <SiteSettingsNav navItems={navItems} />
                {children}
            </main>
        </>
    );
}