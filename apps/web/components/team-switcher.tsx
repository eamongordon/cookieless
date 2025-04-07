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
import { getUserTeamsWrapper } from "@/lib/actions"
import { CreateSiteModal } from "./modal/create-site"
import { CreateTeamModal } from "./modal/create-team"
import { Separator } from "./ui/separator"

type Team = Awaited<ReturnType<typeof getUserTeamsWrapper>>[number];

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const [activeTeam, setActiveTeam] = React.useState<Team | undefined>()
  const [hovered, setHovered] = React.useState<"teams" | "sites" | null>(null)
  const { state } = useSidebar();
  const [teams, setTeams] = React.useState<Team[]>([])
  const [popoverOpen, setPopoverOpen] = React.useState(false)
  React.useEffect(() => {
    getUserTeamsWrapper(true).then((res) => {
      console.log("res", res)
      setTeams(res)
    })
  }, [])
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex aspect-square size-12 items-center justify-center rounded-lg hover:bg-sidebar-accent">
            <Image className="size-8" src="/cookielogo.svg" height={90} width={90} alt="Cookie Logo" />
          </Link>
          <div className={cn("h-6 rotate-[30deg] border-l border-stone-400 dark:border-stone-500", state === "collapsed" && "hidden")} />
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
                    Personal Account
                  </span>
                  <span className="truncate text-xs">Hobby</span>
                </div>
                <ChevronsUpDown size={16} />
              </SidebarMenuButton>
            </PopoverTrigger>
            <PopoverContent
              className={cn("w-[--radix-popover-trigger-width] rounded-lg overflow-clip h-min flex p-0", activeTeam ? "w-96" : "w-48")}
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              <div
                className={cn(
                  "flex-1 rounded-none",
                  hovered === "teams" || hovered === null ? "bg-white" : "bg-neutral-100"
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
                              className="data-[selected='true']:bg-neutral-200"
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
                    hovered === "sites" ? "bg-white" : "bg-neutral-100"
                  )}
                  onMouseEnter={() => setHovered("sites")}
                >
                  <Command className="bg-inherit rounded-none">
                    <CommandInput placeholder="Search sites..." />
                    <CommandList className="flex-1">
                      <CommandEmpty>No results found.</CommandEmpty>
                      {activeTeam.sites.length > 0 && (
                        <CommandGroup heading="Sites">
                          {activeTeam.sites.map((site: Team["sites"]) => (
                            <Link key={site.siteId} href={`/sites/${site.siteId}`}>
                              <CommandItem
                                onSelect={() => {
                                  console.log("selectedSite", site.siteName)
                                  setPopoverOpen(false)
                                }}
                                className="data-[selected='true']:bg-neutral-200"
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