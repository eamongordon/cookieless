import { ReactNode } from "react";
import { getSiteWrapper } from "@/lib/actions";
import SiteSettingsNav from "@/components/sites/settings-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";

export default async function UserSettingsLayout({
    children,
}: {
    children: ReactNode;
}) {

    const navItems = [
        {
            name: "General",
            href: "/settings",
            segment: null,
        },
        {
            name: "Billing",
            href: "/settings/billing",
            segment: "billing",
        },
        {
            name: "API Keys",
            href: "/settings/api-keys",
            segment: "api-keys",
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
                <h1 className="text-xl font-bold sm:text-3xl">
                    Settings for Personal Account
                </h1>
                <SiteSettingsNav navItems={navItems} />
                {children}
            </main>
        </>
    );
}