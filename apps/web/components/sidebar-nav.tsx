// nav.tsx

"use client"

import * as React from "react"
import { ChevronRight, MoreHorizontal, Folder, Forward, Trash2, BookOpen, Bot, Frame, PieChart, Settings2, SquareTerminal, Map, ArrowLeft, BarChart3, Globe, LayoutDashboard, Settings } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarMenuAction, SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"
import { useSelectedLayoutSegments, useParams } from "next/navigation"
import Link from "next/link"

const data = {
    navMain: [
        {
            title: "Playground",
            url: "#",
            icon: SquareTerminal,
            items: [
                {
                    title: "History",
                    url: "#",
                },
                {
                    title: "Starred",
                    url: "#",
                },
                {
                    title: "Settings",
                    url: "#",
                },
            ],
        },
        {
            title: "Models",
            url: "#",
            icon: Bot,
            items: [
                {
                    title: "Genesis",
                    url: "#",
                },
                {
                    title: "Explorer",
                    url: "#",
                },
                {
                    title: "Quantum",
                    url: "#",
                },
            ],
        },
        {
            title: "Documentation",
            url: "#",
            icon: BookOpen,
            items: [
                {
                    title: "Introduction",
                    url: "#",
                },
                {
                    title: "Get Started",
                    url: "#",
                },
                {
                    title: "Tutorials",
                    url: "#",
                },
                {
                    title: "Changelog",
                    url: "#",
                },
            ],
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings2,
            items: [
                {
                    title: "General",
                    url: "#",
                },
                {
                    title: "Team",
                    url: "#",
                },
                {
                    title: "Billing",
                    url: "#",
                },
                {
                    title: "Limits",
                    url: "#",
                },
            ],
        },
    ],
    projects: [
        {
            name: "Design Engineering",
            url: "#",
            icon: Frame,
        },
        {
            name: "Sales & Marketing",
            url: "#",
            icon: PieChart,
        },
        {
            name: "Travel",
            url: "#",
            icon: Map,
        },
    ],
}

interface SubItem {
    title: string;
    url: string;
    isActive?: boolean;
}

interface Item {
    title: string;
    url: string;
    icon?: React.ComponentType;
    items?: SubItem[];
    isActive?: boolean;
}

export function Nav() {
    const { isMobile, state } = useSidebar()
    const segments = useSelectedLayoutSegments();
    const { id } = useParams() as { id?: string };
    const [openItems, setOpenItems] = React.useState<{ [key: string]: boolean }>({})

    const handleToggle = (title: string) => {
        setOpenItems((prev) => ({
            ...prev,
            [title]: !prev[title],
        }))
    }

    const tabs = React.useMemo(() => {
        if (segments[0] === "sites" && id) {
            return [
                {
                    title: "Back to All Sites",
                    url: "/sites",
                    icon: ArrowLeft,
                },
                {
                    title: "Analytics",
                    url: `/sites/${id}`,
                    isActive: segments.length === 2,
                    icon: BarChart3,
                },
                {
                    title: "Settings",
                    url: `/sites/${id}/settings`,
                    isActive: segments.includes("settings"),
                    icon: Settings,
                    items: [
                        {
                            title: "General",
                            url: `/sites/${id}/settings/`,
                            isActive: segments.includes("settings") && !segments[3]
                        },
                        {
                            title: "Funnels",
                            url: `/sites/${id}/settings/custom-properties`,
                            isActive: segments.includes("custom-properties")
                        }
                    ]
                },
            ];
        }
        return [
            {
                title: "Overview",
                url: "/",
                isActive: segments.length === 0,
                icon: LayoutDashboard,
            },
            {
                title: "Sites",
                url: "/sites",
                isActive: segments[0] === "sites",
                icon: Globe,
            },
            {
                title: "Settings",
                url: "/settings",
                isActive: segments[0] === "settings",
                icon: Settings
            },
        ];
    }, [segments, id]);

    return (
        <>
            <SidebarGroup>
                <SidebarGroupLabel>Platform</SidebarGroupLabel>
                <SidebarMenu>
                    {tabs.map((item: Item) => (
                        item.items ? (
                            <Collapsible
                                key={item.title}
                                asChild
                                defaultOpen={item.isActive}
                                className="group/collapsible"
                                onOpenChange={() => handleToggle(item.title)}
                            >

                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        {openItems[item.title] ? (
                                            <SidebarMenuButton className={item.isActive && state === "collapsed" ? "rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-200" : ""} tooltip={item.title}>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        ) : (
                                            <SidebarMenuButton className={item.isActive && state === "collapsed" ? "rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-200" : ""} tooltip={item.title} asChild>
                                                <Link href={item.url}>
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </Link>
                                            </SidebarMenuButton>
                                        )}
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton asChild className={subItem.isActive ? "rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-200" : ""}>
                                                        <Link href={subItem.url}>
                                                            <span>{subItem.title}</span>
                                                        </Link>
                                                    </SidebarMenuSubButton>
                                                </SidebarMenuSubItem>
                                            ))}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        ) : (
                            <SidebarMenuItem>
                                <SidebarMenuButton className={item.isActive ? "rounded-md bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-200" : ""} tooltip={item.title} asChild>
                                    <Link href={item.url}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    ))}
                </SidebarMenu>
            </SidebarGroup>
            <SidebarGroup className="group-data-[collapsible=icon]:hidden">
                <SidebarGroupLabel>Projects</SidebarGroupLabel>
                <SidebarMenu>
                    {data.projects.map((item) => (
                        <SidebarMenuItem key={item.name}>
                            <SidebarMenuButton asChild>
                                <a href={item.url}>
                                    <item.icon />
                                    <span>{item.name}</span>
                                </a>
                            </SidebarMenuButton>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuAction showOnHover>
                                        <MoreHorizontal />
                                        <span className="sr-only">More</span>
                                    </SidebarMenuAction>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-48 rounded-lg"
                                    side={isMobile ? "bottom" : "right"}
                                    align={isMobile ? "end" : "start"}
                                >
                                    <DropdownMenuItem>
                                        <Folder className="text-neutral-500 dark:text-neutral-400" />
                                        <span>View Project</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Forward className="text-neutral-500 dark:text-neutral-400" />
                                        <span>Share Project</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Trash2 className="text-neutral-500 dark:text-neutral-400" />
                                        <span>Delete Project</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    ))}
                    <SidebarMenuItem>
                        <SidebarMenuButton className="text-sidebar-foreground/70">
                            <MoreHorizontal className="text-sidebar-foreground/70" />
                            <span>More</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroup>
        </>
    )
}