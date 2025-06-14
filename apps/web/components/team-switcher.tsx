"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
  CommandEmpty
} from "@/components/ui/command"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { type getSiteWrapper, type getTeamWrapper, getUserTeamsWrapper } from "@/lib/actions"
import { CreateSiteModal } from "./modal/create-site"
import { CreateTeamModal } from "./modal/create-team"
import { Separator } from "./ui/separator"

type FullTeam = Awaited<ReturnType<typeof getTeamWrapper>>;
type FullSite = Awaited<ReturnType<typeof getSiteWrapper>>;

type DisplayTeam = Awaited<ReturnType<typeof getUserTeamsWrapper>>[number];

export function TeamSwitcher({ currentTeam, currentSite, userSubscriptonStatus }: { currentTeam?: FullTeam, currentSite?: FullSite, userSubscriptonStatus?: string }) {
  const { isMobile } = useSidebar();
  const { state } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState<DisplayTeam | undefined>()
  const [hovered, setHovered] = React.useState<"teams" | "sites" | null>(null)
  const [teams, setTeams] = React.useState<DisplayTeam[]>([])
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  React.useEffect(() => {
    getUserTeamsWrapper(true).then((res) => {
      console.log("res", res)
      setTeams(res)
    })
  }, []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex aspect-square size-12 items-center justify-center rounded-lg hover:bg-sidebar-accent">
            <Image className="size-8" src="/cookielogo.svg" height={90} width={90} alt="Cookie Logo" />
          </Link>
          <div className={cn("h-6 rotate-30 border-l border-sidebar-border", state === "collapsed" && "hidden")} />
          <Popover
            onOpenChange={(open) => {
              setPopoverOpen(open)
              if (!open) {
                setActiveTeam(undefined)
                setHovered(null)
              }
            }}
            open={popoverOpen}
          >
            <PopoverTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-sidebar-accent-foreground">
                    {currentSite ? currentSite.name : currentTeam ? currentTeam.name : "Personal Account"}
                  </span>
                  <span className="truncate text-xs">{currentSite ? currentTeam ? currentTeam.name : "Personal Account" : currentTeam ? currentTeam.subscriptionStatus === "active" ? "Pro" : "Hobby" : userSubscriptonStatus === "active" ? "Pro" : "Hobby"}</span>
                </div>
                <ChevronsUpDown size={16} />
              </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent
              className={cn("w-(--radix-popover-trigger-width) rounded-lg overflow-clip h-min flex p-0", activeTeam ? "w-96" : "w-48")}
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <div
                className={cn(
                  "flex-1 rounded-none",
                  hovered === "teams" || hovered === null ? "bg-background" : "bg-sidebar"
                )}
                onMouseEnter={() => setHovered("teams")}
              >
                <Command className="bg-inherit rounded-none">
                  <CommandInput placeholder="Search teams..." />
                  <CommandList className="flex-1">
                    <CommandEmpty>No results found.</CommandEmpty>
                    {teams.length > 0 && (
                      <CommandGroup heading="Teams">
                        {teams.map((team) => (
                          <Link key={team.teamId} href={`/teams/${team.teamId}`}>
                            <CommandItem
                              onMouseEnter={() => {
                                setActiveTeam(team)
                              }}
                              onSelect={() => {
                                setActiveTeam(team)
                                setPopoverOpen(false)
                              }}
                              className="dark:data-[selected='true']:bg-secondary"
                            >
                              <div className="flex items-center gap-2">
                                <span>{team.teamName}</span>
                              </div>
                            </CommandItem>
                          </Link>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                  <Separator />
                  <div
                    className="w-full"
                    onMouseEnter={() => {
                      setActiveTeam(undefined)
                    }}
                  >
                    <CreateTeamModal />
                  </div>
                </Command>
              </div>
              {activeTeam && (
                <div
                  className={cn(
                    "flex-1 rounded-none",
                    hovered === "sites" ? "bg-background" : "bg-sidebar"
                  )}
                  onMouseEnter={() => setHovered("sites")}
                >
                  <Command className="bg-inherit rounded-none">
                    <CommandInput placeholder="Search sites..." />
                    <CommandList className="flex-1">
                      <CommandEmpty>No results found.</CommandEmpty>
                      {activeTeam.sites.length > 0 && (
                        <CommandGroup heading="Sites">
                          {activeTeam.sites.map((site: DisplayTeam["sites"]) => (
                            <Link key={site.siteId} href={`/sites/${site.siteId}`}>
                              <CommandItem
                                onSelect={() => {
                                  console.log("selectedSite", site.siteName)
                                  setPopoverOpen(false)
                                }}
                                className="dark:data-[selected='true']:bg-secondary"
                              >
                                <span>{site.siteName}</span>
                              </CommandItem>
                            </Link>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                    <Separator />
                    <CreateSiteModal isTeamsMenu teamId={activeTeam} />
                  </Command>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div >
      </SidebarMenuItem >
    </SidebarMenu >
  )
}