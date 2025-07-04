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
import { DocNode } from "@/lib/docs"

const data = {
    navMain: [
        {
            title: "Playground",
            url: "#",
            icon: <SquareTerminal />,
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
            icon: <Bot />,
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
            icon: <BookOpen />,
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
            icon: <Settings2 />,
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
            icon: <Frame size={22} strokeWidth={1.5} />,
        },
        {
            name: "Sales & Marketing",
            url: "#",
            icon: <PieChart size={22} strokeWidth={1.5} />,
        },
        {
            name: "Travel",
            url: "#",
            icon: <Map size={22} strokeWidth={1.5} />,
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
    icon?: React.ReactNode;
    items?: SubItem[];
    isActive?: boolean;
}

interface DocsNavProps {
    docsTree: DocNode[];
}

function groupByCategory(nodes: DocNode[]) {
    const grouped: { [category: string]: DocNode[] } = {};
    const root: DocNode[] = [];
    for (const node of nodes) {
        const cat = node.category;
        if (!cat) {
            root.push(node);
        } else {
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(node);
        }
    }
    return { grouped, root };
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
                    icon: <ArrowLeft size={16} />,
                },
                {
                    title: "Analytics",
                    url: `/sites/${id}`,
                    isActive: segments.length === 2,
                    icon: <BarChart3 size={22} strokeWidth={1.5} />,
                },
                {
                    title: "Settings",
                    url: `/sites/${id}/settings`,
                    isActive: segments.includes("settings"),
                    icon: <Settings size={22} strokeWidth={1.5} />,
                    items: [
                        {
                            title: "General",
                            url: `/sites/${id}/settings/`,
                            isActive: segments.includes("settings") && !segments[3]
                        },
                        {
                            title: "Custom Properties",
                            url: `/sites/${id}/settings/custom-properties`,
                            isActive: segments.includes("custom-properties")
                        },
                        {
                            title: "Funnels",
                            url: `/sites/${id}/settings/funnels`,
                            isActive: segments.includes("funnels")
                        }
                    ]
                },
            ];
        }
        return [
            {
                title: "Sites",
                url: "/sites",
                isActive: segments[0] === "sites",
                icon: <Globe size={22} strokeWidth={1.5} />,
            },
            {
                title: "Settings",
                url: "/settings",
                isActive: segments[0] === "settings",
                icon: <Settings size={22} strokeWidth={1.5} />
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
                                            <SidebarMenuButton isActive={item.isActive && state === "collapsed"} tooltip={item.title}>
                                                {item.icon && React.cloneElement(item.icon as React.ReactElement<any>)}
                                                <span className="font-medium">{item.title}</span>
                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" size={16} />
                                            </SidebarMenuButton>
                                        ) : (
                                            <SidebarMenuButton isActive={item.isActive && state === "collapsed"} tooltip={item.title} asChild>
                                                <Link href={item.url}>
                                                    {item.icon && React.cloneElement(item.icon as React.ReactElement<any>)}
                                                    <span className="font-medium">{item.title}</span>
                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" size={16} />
                                                </Link>
                                            </SidebarMenuButton>
                                        )}
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items?.map((subItem) => (
                                                <SidebarMenuSubItem key={subItem.title}>
                                                    <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                                                        <Link href={subItem.url}>
                                                            <span className="font-medium">{subItem.title}</span>
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
                                <SidebarMenuButton isActive={item.isActive} tooltip={item.title} asChild>
                                    <Link href={item.url}>
                                        {item.icon && React.cloneElement(item.icon as React.ReactElement<any>)}
                                        <span className="font-medium">{item.title}</span>
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
                                    {React.cloneElement(item.icon as React.ReactElement<any>)}
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
    );
}

export function DocsNav({ docsTree }: DocsNavProps) {
    const segments = useSelectedLayoutSegments();
    const currentPath = segments.join("/");
    const { grouped, root } = groupByCategory(docsTree);
    const isHomePage = segments.length === 0; // /docs root

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Documentation</SidebarGroupLabel>
            <SidebarMenu>
                {/* Introduction/Home link */}
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isHomePage}>
                        <Link href="/docs">
                            <span className="font-medium">Introduction</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                {/* Render root-level docs (no category) */}
                {root.map((node) => (
                    <SidebarMenuItem key={node.path}>
                        <SidebarMenuButton asChild isActive={currentPath === node.path}>
                            <Link href={`/docs/${node.path}`}>
                                <span className="font-medium">{node.title || node.name}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
                {/* Render grouped categories as collapsibles */}
                {Object.entries(grouped).map(([category, items]) => (
                    <Collapsible key={category} asChild defaultOpen={true} className="group/collapsible">
                        <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                                <SidebarMenuButton tooltip={category}>
                                    <span className="font-medium">{category}</span>
                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" size={16} />
                                </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {items.map((node) => (
                                        <SidebarMenuSubItem key={node.path}>
                                            <SidebarMenuSubButton asChild isActive={currentPath === node.path}>
                                                <Link href={`/docs/${node.path}`}>
                                                    <span className="font-medium">{node.title || node.name}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </SidebarMenuItem>
                    </Collapsible>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}